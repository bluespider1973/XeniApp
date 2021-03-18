const fs = require('fs');
const Jimp = require('jimp');
const CryptoJS = require('crypto-js');
const getMetadata = require('url-metadata');

const db = require('../models');
const {Generate, sendSimpleMail} = require('../lib');
const ImageProcessing = require('../lib/imageProcessing');

const User = db.user;
const TokenHistory = db.tokenHistory;
const Video = db.video;
const PlaylistVideo = db.playlistVideo;
const DeletedFile = db.deletedFile;

var global_data = require('../tools/GlobalData');
const API_URL = global_data.back_end_server_ip + ':' + global_data.back_end_server_port + '/api/image/getImageFile/';


const uploadVideo = async(req, res)=>{
    const {user_id, access_key, video_id} = req.query;

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

            let meta_title, meta_image, meta_keyword, meta_description, meta_restriction_age;
            await getMetadata(video_id).then(( metadata) => {
                try{
					console.log( metadata);
					meta_title = metadata.title;
					meta_image = metadata.image;
					meta_keyword = metadata.keyword;
					meta_description = metadata.description;
					meta_restriction_age = metadata['og:restrictions:age'];
					console.log( "og:restrictions:age=[" + meta_restriction_age + "]");
				}catch( err_parse){
					console.log( "parse eror of metadata=" + err_parse);
				}
            },(error) => {
                res.status(200).send({
                    message: error.message,
                });
            })

            const video = await Video.create({
                video_id,
                meta_title,
                meta_image,
                meta_keyword,
                meta_description,
                meta_restriction_age,
            });

            user.addVideo(video).then(async result=>{
                res.status(200).send({
                    message: "success",
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
        res.status(500).send({
            message: err
        })
    }
}


const addPlaylistIds = async(req, res)=>{
    const {user_id, access_key, video_id} = req.query;
    const playlist_ids = req.body;

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

            await PlaylistVideo.destroy({
                where: {
                    videoId: video_id
                }
            })

            playlist_ids.forEach( async item => {
                await PlaylistVideo.create({
                    videoId: video_id,
                    playlistId: item,
                    userId: user.id
                });
            })
        }).catch(err=>{
            res.status(500).send({
                message: err.message
            });
        })
    } catch(err){
        res.status(500).send({
            message: err
        })
    }
}


const getPlaylistIds = async(req, res)=>{
    const {user_id, access_key, video_id} = req.query;

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

            const playlists = await PlaylistVideo.findAll({
                attributes: ['playlistId'],
                where: {
                    videoId: video_id
                }
            })

            let arr = [];
            playlists.forEach(element => {
                arr.push(element.playlistId)
            });
            res.status(200).send({
                message: 'success',
                playlists: arr,
            })

        }).catch(err=>{
            res.status(500).send({
                message: err.message
            });
        })
    } catch(err){
        res.status(500).send({
            message: err
        })
    }
}


const removeVideo = (req, res) =>{
    const {user_id, user_key} = req.query;
    const id = req.params.id;

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

        const video = await Video.findOne({
            where: { id: id }
        });
        if(!video){
            return res.status(404).send({
                message: "Invalid Image Id."
            });
        }

        await video.destroy();

        return res.status(200).send({
            message: "success"
        })

    }).catch((err)=>{
        return res.status(500).send({
            message: err.message,
        })
    });
}

const changeVideoGroup = (req, res) =>{
    const {user_id, user_key, playlist_id} = req.query;
    const id = req.params.id;

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

        const video = await Video.findOne({
            where: { id: id }
        });
        if(!video){
            return res.status(404).send({
                message: "Invalid Image Id."
            });
        }

        await video.update({
            playlist_id: playlist_id,
        })

        return res.status(200).send({
            message: "success"
        })

    }).catch((err)=>{
        return res.status(500).send({
            message: err.message,
        })
    });
}

const getAllVideoList = (req, res)=>{
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
        const videos = await user.getVideo();

        let fileInfos = [];
		list_counter = 1;

		await videos.forEach(video => {
            fileInfos.push({
                id: video.id,
                video_id: video.video_id,
                meta_title: video.meta_title,
                meta_image: video.meta_image,
                meta_keyword: video.meta_keyword,
                meta_description: video.meta_description,
                playlist_id: video.playlist_id,
                id_counter: list_counter++,
                dateTime: video.createdAt,
            });
        });
        res.status(200).send(fileInfos);
    })
}

module.exports = {
    uploadVideo,
    addPlaylistIds,
    getPlaylistIds,
    removeVideo,
    changeVideoGroup,
    getAllVideoList,
}