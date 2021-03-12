const uploadPPTFile = require('../middleware/uploadFiles');
const db = require('../models');
const {Generate, sendSimpleMail} = require('../lib');
const PPTProcessing = require('../lib/pptProcessing');

const User = db.user;
const TokenHistory = db.tokenHistory;
const PPT = db.ppt;

var global_data = require('../tools/GlobalData');
const API_URL = global_data.back_end_server_ip + ':' + global_data.back_end_server_port + '/api/ppt/getPPTFile/';
//   thumb_url: `http://localhost:3030/api/ppt/getPPTFile/${ppt.ppt_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=thumb`,
//                                     thumb_url_2: `{API_URL}${ppt.ppt_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=thumb`,

const uploadPPT = async(req, res)=>{
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

            const ppt_id = Generate.key();
            req.fileId = ppt_id;
            await uploadPPTFile(req, res);
            if(req.file == undefined){
                return res.status(400).send({
                    message: "Please upload a file."
                });
            }
            const path = req.file.destination;

            const ppt = await PPT.create({
                file_name: req.file.filename,
                path: path,
                ppt_id: ppt_id,
                operation: "Upload",
                source_ppt_id: "",
                origin_ppt_id: ppt_id,
            });
            user.addPPT(ppt).then(async result=>{
                sendSimpleMail({username: user.username, email: user.email, user_id: user.user_id, reset_key: ppt_id, type: "ppt_upload"},
                    function(err, val){
                        if(val=="success"){
                            console.log("An email to confirm upload is sent successfully.");
                        }else{
                            console.log("PPT upload email is sent failed. "+err);
                        }
                    });
                res.status(200).send({
                    message: "Uploaded the file successfully: "+ req.file.filename + ", ppt_id: "+ppt_id,
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

const getPPTFileList = (req, res)=>{
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
        const ppts = await user.getPPT();

        let fileInfos=[];
		list_counter = 1;
		ppts.forEach(ppt=>{
            if(!ppt.source_ppt_id){
                fileInfos.push({
					id: ppt.id,
					id_counter: list_counter++,
                    file_name: ppt.file_name,
                    dateTime: ppt.createdAt,
                    ppt_id: ppt.ppt_id,
                    operation: ppt.operation,
                    source_ppt_id: ppt.source_ppt_id,
                    thumb_url: `${API_URL}${ppt.ppt_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=thumb`,
                    url: `${API_URL}${ppt.ppt_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=download`,
                    thumb_url_3: `http://localhost:3030/api/ppt/getPPTFile/${ppt.ppt_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=thumb`,
                    url_3: `http://localhost:3030/api/ppt/getPPTFile/${ppt.ppt_id}?user_id=${user.user_id}&user_key=${user.access_key}&type=download`,
                });
            }
        });
        res.status(200).send(fileInfos);
    })
}

const download = (req, res)=>{
    var ppt_id = req.params.ppt_id;
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

        // TODO : check the owner ppt
        const ppts = await user.getPPT();
        const ppt = ppts.find(item=>item.ppt_id==ppt_id);
        if(ppt){
            let file_name="";
            if(type=="download"){
                // TODO : get ppt file name, add Token history and subtraction 1 token.
                if(user.nr_tokens<=0){
                    return res.status(400).send({
                        message: "Not Enough Tokens."
                    });
                }
                file_name = ppt.file_name;
            }

            const directoryPath = ppt.path+"/";

            res.download(directoryPath+file_name, file_name, async (err)=>{
                if(err){
                    return res.status(500).send({message: "Could not download the file. "+ err});
                }else{
                    if(type=="download"){
                        await user.update({nr_tokens: user.nr_tokens-1});
                        const tokenHistory = await TokenHistory.create({
                            service: "Download An PPT",
                            spent_tokens: -1,
                            current_tokens: user.nr_tokens
                        });
                        await user.addTokenHistory(tokenHistory);
                    }
                }
            })
        }else{
            return res.status(404).send({message: "Invalid PPT Id"});
        }
        //
    })

}

const getPPTHistory = (req, res)=>{
    const {user_id, user_key} = req.query;
    const ppt_id = req.params.ppt_id;
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
        const ppts = await user.getPPT();
        const ppt = ppts.find(p=>p.ppt_id==ppt_id);

        let fileInfos=[];
        ppts.forEach(p=>{
            if(p.origin_ppt_id==ppt.origin_ppt_id){
                fileInfos.push({
                    file_name: p.file_name,
                    dateTime: p.createdAt,
                    ppt_id: p.ppt_id,
                    operation: p.operation,
                    source_ppt_id: p.source_ppt_id,
                });
            }
        });
        return res.status(200).send(fileInfos);
    }).catch(err=>{
        return res.status(500).send({
            pptId: Math.random(),
            message: err.message
        })
    })
}

const addNewSlidePPT = (req,res)=>{
    const {user_id, user_key} = req.query;
    const ppt_id = req.params.ppt_id;
    console.log( "addNewSlidePPT query=" + req.query + " ppt_id=" + ppt_id);

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
    	console.log( "addNewSlidePPT await user");
        const ppts = await user.getPPT();
    	console.log( "addNewSlidePPT find ppt_id=" + ppt_id);
        const ppt = ppts.find( item => item.ppt_id == ppt_id);
    	console.log( "addNewSlidePPT generate path for user_id=" + user.user_id);
        const new_path = Generate.path( "ppt", user.user_id);
    	console.log( "addNewSlidePPT new filename start");
        const new_filename = await PPTProcessing.add_new_slide(ppt.path, ppt.file_name, new_path);
    	console.log( "addNewSlidePPT new filename=" + new_filename);
        if( new_filename){
    		console.log( "addNewSlidePPT generate key");
            const new_ppt_id = Generate.key();
            const new_ppt = await PPT.create({
                file_name: new_filename,
                path: new_path,
                ppt_id: new_ppt_id,
                operation: "add new slide",
                source_ppt_id: ppt.ppt_id,
                origin_ppt_id: ppt.origin_ppt_id,
            });
            user.addPPT(new_ppt).then(async result=>{
                /*
                sendSimpleMail({username: user.username, email: user.email, user_id: user.user_id, reset_key: new_ppt_id, type: "add_new_slide"},
                    function(err, val){
                        if(val=="success"){
                            console.log("An email to confirm add new slide is sent successfully.");
                        }else{
                            console.log("Add new slide email is sent failed. "+err);
                        }
                    });
                    */
                await user.update({nr_tokens: user.nr_tokens-1});
                const tokenHistory = await TokenHistory.create({
                    service: "Rotate the PPT",
                    spent_tokens: -1,
                    current_tokens: user.nr_tokens
                });
                await user.addTokenHistory(tokenHistory);
                res.status(200).send({
                    pptId: new_ppt_id,
                });
            }).catch(err=>{
                res.status(500).send({
                    message: err.message
                })
            })
        }else{
            res.status(500).send({ message: "file name not created"})
		}
    }).catch(err=>{
        return res.status(500).send({
            pptId: Math.random(),
            message: err.message
        })
    })
}
module.exports = {
    uploadPPT,
    getPPTFileList,
    download,
    getPPTHistory,
    addNewSlidePPT
}
