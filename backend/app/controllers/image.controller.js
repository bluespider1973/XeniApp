const uploadImageFile = require('../middleware/uploadFiles');
const fs = require('fs');
const db = require('../models');
const Jimp = require('jimp');
const CryptoJS = require('crypto-js');
const {Generate, sendSimpleMail} = require('../lib');
const ImageProcessing = require('../lib/imageProcessing');

const User = db.user;
const TokenHistory = db.tokenHistory;
const Image = db.image;
const DeletedFile = db.deletedFile;

var global_data = require('../tools/GlobalData');
const API_URL = global_data.back_end_server_ip + ':' + global_data.back_end_server_port + '/api/image/getImageFile/';
//   thumb_url: `http://localhost:3030/api/image/getImageFile/${image.image_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=thumb`,
//                                     thumb_url_2: `{API_URL}${image.image_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=thumb`,

const uploadImage = async(req, res)=>{
    const {user_id, access_key} = req.params;

    try{
        User.findOne({
            where: {
                user_id: user_id
            }
        }).then(async user=>{
            if(!user){
                return res.status(404).send({
                    message: "Invalid User Id."
                });
            }
            if(user.access_key !== access_key){
                return res.status(403).send({
                    message: "Forbidden."
                })
            }

            const image_id = Generate.key();
            req.fileId = image_id;
            await uploadImageFile(req, res);
            if(req.file == undefined){
                return res.status(400).send({
                    message: "Please upload a file."
                });
            }
            const path = req.file.destination;

            const thumb_name = await ImageProcessing.makeThumb(path, req.file.filename, path);

            const image = await Image.create({
                file_name: req.file.filename,
                thumb_name: thumb_name,
                path: path,
                image_id: image_id,
                operation: "Upload",
                source_image_id: "",
                origin_image_id: image_id,
            });
            user.addImage(image).then(async result=>{
                /*
                sendSimpleMail({username: user.username, email: user.email, user_id: user.user_id, reset_key: image_id, type: "image_upload"},
                    function(err, val){
                        if(val=="success"){
                            console.log("An email to confirm upload is sent successfully.");
                        }else{
                            console.log("Image upload email is sent failed. "+err);
                        }
                    });
                */
                res.status(200).send({
                    message: "Uploaded the file successfully: "+ req.file.filename + ", image_id: "+image_id,
                });
            }).catch(err=>{
                res.status(500).send({
                    message: err.message
                })
            })
        }).catch(err=>{
            res.status(500).send({
                message: err.message
            });
        })
    } catch(err){

        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
            message: "File size cannot be larger than 2MB!",
            });
        }

        res.status(500).send({
            message: `Could not upload the file : ${req.file.filename}. ${err}`
        })
    }
}

const removeImage = (req, res) =>{
    const {user_id, user_key} = req.query;
    const image_id = req.params.image_id;
    
    User.findOne({
        where: {
            user_id: user_id
        }
    }).then(async (user)=>{
        if(!user){
            return res.status(404).send({                
                message: "User Not Found."
            });
        }
        if(user.access_key != user_key){
            return res.status(400).send({                
                message: "Invalid User Key."
            });
        }
        
        const image = await Image.findOne({
            where: {
                image_id: image_id,
            }
        });
        if(!image){
            return res.status(404).send({                
                message: "Invalid Image Id."
            });
        }
        
        const isDeleted = await ImageProcessing.deleteImage(image.path, image.file_name, image.thumb_name);
        if ( isDeleted ) {
            const deleted_image = await DeletedFile.create({
                file_name: image.file_name,
                thumb_name: image.thumb_name,
                path: image.path,
                image_id: image.image_id,
                operation: "remove image",
                source_image_id: image.source_image_id,
                origin_image_id: image.origin_image_id,
                type: "image"
            });
            await user.addDeletedFile(deleted_image);
            await image.destroy();
            
            if (!deleted_image.source_image_id) {
                const nextImage = await Image.findOne({
                    where: {
                        origin_image_id: deleted_image.image_id
                    }
                });

                if (nextImage) {
                    nextImage.update({
                        source_image_id: ""
                    })

                }
            }

            return res.status(200).send({
                message: "success"
            });
        }else{
            return res.status(500).send({
                message: "Unknown Error",
            });
        }
    }).catch((err)=>{
        return res.status(500).send({
            message: err.message,
        })
    });
}

const getImageFileList = (req, res)=>{
    const {user_id, user_key} = req.query;

    User.findOne({
        where: {
            user_id: user_id
        }
    }).then(async user=>{
        if(!user){
            return res.status(404).send({
                message: "User Not Found."
            });
        }
        if(user.access_key!=user_key){
            return res.status(400).send({
                message: "Invalid User Key."
            });
        }
        const images = await user.getImage();

        let fileInfos=[];
		list_counter = 1;
		images.forEach(image=>{
            if(!image.source_image_id){
                fileInfos.push({
					id: image.id,
					id_counter: list_counter++,
                    file_name: image.file_name,
                    dateTime: image.createdAt,
                    image_id: image.image_id,
                    operation: image.operation,
                    description: image.description,
                    source_image_id: image.source_image_id,
                    thumb_url: `${API_URL}${image.image_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=thumb`,
                    url: `${API_URL}${image.image_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=download`,
                    thumb_url_3: `http://localhost:3030/api/image/getImageFile/${image.image_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=thumb`,
                    url_3: `http://localhost:3030/api/image/getImageFile/${image.image_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=download`,
                });
            }
        });
        res.status(200).send(fileInfos);
    })
}

const getAllImageFileList = (req, res)=>{
    const {user_id, user_key} = req.query;

    User.findOne({
        where: {
            user_id: user_id
        }
    }).then(async user=>{
        if(!user){
            return res.status(404).send({
                message: "User Not Found."
            });
        }
        if(user.access_key!=user_key){
            return res.status(400).send({
                message: "Invalid User Key."
            });
        }
        const images = await user.getImage();

        let fileInfos=[];
		list_counter = 1;
		images.forEach(image=>{
            fileInfos.push({
                id: image.id,
                id_counter: list_counter++,
                file_name: image.file_name,
                dateTime: image.createdAt,
                image_id: image.image_id,
                operation: image.operation,
                description: image.description,
                source_image_id: image.source_image_id,
                thumb_url: `${API_URL}${image.image_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=thumb`,
                url: `${API_URL}${image.image_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=download`,
                thumb_url_3: `http://localhost:3030/api/image/getImageFile/${image.image_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=thumb`,
                url_3: `http://localhost:3030/api/image/getImageFile/${image.image_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=download`,
            });
        });
        res.status(200).send(fileInfos);
    })
}

const rotateImage = (req,res)=>{
    const {user_id, user_key, degree, clock} = req.query;
    const image_id = req.params.image_id;
    User.findOne({
        where: {user_id: user_id}
    }).then(async user=>{
        if(!user){
            return res.status(404).send({
                message: "User Not Found"
            })
        }
        if(user.access_key!==user_key){
            return res.status(403).send({
                message: "Invalid User Key"
            })
        }
        if(user.nr_tokens<=0){
            return res.status(401).send({
                message: "Not Enough Tokens"
            })
        }
        const images = await user.getImage();
        const image = images.find(item=>item.image_id==image_id);
        const new_path = Generate.path("image", user.user_id);
        const new_filename = await ImageProcessing.rotate_90_clock(image.path, image.file_name, new_path);
        if(new_filename){
            const new_image_id = Generate.key();
            const new_thumb_name = await ImageProcessing.makeThumb(new_path, new_filename, new_path);

            const new_image = await Image.create({
                file_name: new_filename,
                thumb_name: new_thumb_name,
                path: new_path,
                image_id: new_image_id,
                operation: "Rotate 90 Clock",
                description: image.description,
                source_image_id: image.image_id,
                origin_image_id: image.origin_image_id,
            });
            user.addImage(new_image).then(async result=>{
                /*
                sendSimpleMail({username: user.username, email: user.email, user_id: user.user_id, reset_key: new_image_id, type: "image_rotate"},
                    function(err, val){
                        if(val=="success"){
                            console.log("An email to confirm upload is sent successfully.");
                        }else{
                            console.log("Image upload email is sent failed. "+err);
                        }
                    });
                    */
                await user.update({nr_tokens: user.nr_tokens-1});
                const tokenHistory = await TokenHistory.create({
                    service: "Rotate the Image",
                    spent_tokens: -1,
                    current_tokens: user.nr_tokens
                });
                await user.addTokenHistory(tokenHistory);
                res.status(200).send({
                    imageId: new_image_id,
                });
            }).catch(err=>{
                res.status(500).send({
                    message: err.message
                })
            })
        }
    }).catch(err=>{
        return res.status(500).send({
            imageId: Math.random(),
            message: err.message
        })
    })
}

const addImageDescription = (req, res) => {
    const {user_id, user_key, image_description} = req.query;
    const image_id = req.params.image_id;

    User.findOne({
        where: {user_id: user_id}
    }).then(async user => {
        if (!user) {
            return res.status(404).send({
                message: "User Not Found"
            })
        }
        if (user.access_key !== user_key) {
            return res.status(403).send({
                message: "Invalid User Key"
            })
        }
        if(user.nr_tokens<=0){
            return res.status(401).send({
                message: "Not Enough Tokens"
            })
        }

        const image = await Image.findOne({
            where: {
                image_id: image_id,
            }
        });
        if(!image){
            return res.status(404).send({                
                message: "Invalid Image Id."
            });
        } else {
            image.update({
                description: image_description
            })
        }
        
        return res.status(200).send({
            message: "success"
        })

    }).catch((err) => {
        return res.status(500).send({
            message: err.message
        })
    })
}

const download = (req, res)=>{
    var image_id = req.params.image_id;
    const {user_id, user_key, type} = req.query;

    User.findOne({
        where: {
            user_id: user_id
        }
    }).then(async user=>{
        if(!user){
            return res.status(404).send({
                message: "User Not Found."
            });
        }
        if(user.access_key!=user_key){
            return res.status(400).send({
                message: "Invalid User Key",
            });
        }

        // TODO : check the owner image
        const images = await user.getImage();
        const image = images.find(item=>item.image_id==image_id);
        if(image){
            var file_name="";
            if(type=="download"){
                // TODO : get image file name, add Token history and subtraction 1 token.
                if(user.nr_tokens<=0){
                    return res.status(400).send({
                        message: "Not Enough Tokens."
                    });
                }
                file_name = image.file_name;
            }else if(type=="preview"){
                file_name = image.file_name;
            }else if(type=="thumb"){
                // TODO : get thumb file name
                file_name = image.thumb_name;
            }else{
                return res.status(400).send({
                    message: "Type Error.",
                });
            }

            const directoryPath = image.path+"/";

            res.download(directoryPath+file_name, file_name, async (err)=>{
                if(err){
                    return res.status(500).send({message: "Could not download the file. "+ err});
                }else{
                    if(type=="download"){
                        await user.update({nr_tokens: user.nr_tokens-1});
                        const tokenHistory = await TokenHistory.create({
                            service: "Download An Image",
                            spent_tokens: -1,
                            current_tokens: user.nr_tokens
                        });
                        await user.addTokenHistory(tokenHistory);
                    }
                }
            })
        }else{
            return res.status(404).send({message: "Invalid Image Id"});
        }
        //
    })

}

const getImageHistory = (req, res)=>{
    const {user_id, user_key} = req.query;
    const image_id = req.params.image_id;
    User.findOne({
        where: {user_id: user_id}
    }).then(async user=>{
        if(!user){
            return res.status(404).send({
                message: "User Not Found"
            })
        }
        if(user.access_key!==user_key){
            return res.status(403).send({
                message: "Invalid User Key"
            })
        }
        const images = await user.getImage();
        const image = images.find(img=>img.image_id==image_id);

        let fileInfos=[];
        images.forEach(img=>{
            if(img.origin_image_id==image.origin_image_id){
                fileInfos.push({
                    file_name: img.file_name,
                    dateTime: img.createdAt,
                    image_id: img.image_id,
                    operation: img.operation,
                    source_image_id: img.source_image_id,
                    description: img.description,
                });
            }
        });
        return res.status(200).send(fileInfos);
    }).catch(err=>{
        return res.status(500).send({
            imageId: Math.random(),
            message: err.message
        })
    })
}

module.exports = {
    uploadImage,
    removeImage,
    getImageFileList,
    getAllImageFileList,
    download,
    rotateImage,
    addImageDescription,
    getImageHistory,
}
