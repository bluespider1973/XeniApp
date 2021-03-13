const fs = require('fs');
const Jimp = require('jimp');
const CryptoJS = require('crypto-js');

const db = require('../models');
const {Generate, sendSimpleMail} = require('../lib');

const User = db.user;
const Playlist = db.playlist;
const Video = db.video;

var global_data = require('../tools/GlobalData');
const API_URL = global_data.back_end_server_ip + ':' + global_data.back_end_server_port + '/api/image/getImageFile/';


const addPlaylist = async(req, res)=>{
    const {user_id, access_key, playlist_title, playlist_status } = req.query;

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

            const playlist_id = await Generate.key();

            const playlist = await Playlist.create({
                playlist_id,
                playlist_title,
                playlist_status,
            });

            user.addPlaylist(playlist).then(async result=>{
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

const removePlaylist = (req, res) =>{
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
        
        const playlist = await Playlist.findOne({
            where: { playlist_id: id }
        });
        if(!playlist){
            return res.status(404).send({                
                message: "Invalid Image Id."
            });
        }

        await playlist.destroy();

        return res.status(200).send({
            message: "success"
        })

    }).catch((err)=>{
        return res.status(500).send({
            message: err.message,
        })
    });
}


const changePlaylist = (req, res) =>{
    const {user_id, user_key, currentPlaylistTitle, currentPlaylistStatus} = req.query;
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
        
        const playlist = await Playlist.findOne({
            where: { playlist_id: id }
        });
        if(!playlist){
            return res.status(404).send({                
                message: "Invalid Image Id."
            });
        }

        await playlist.update({
            playlist_title: currentPlaylistTitle,
            playlist_status: currentPlaylistStatus,
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


const getAllPlaylist = (req, res)=>{
    const {user_id, access_key} = req.query;

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
        if(user.access_key!=access_key){
            return res.status(400).send({
                message: "Invalid User Key."
            });
        }

        const playlists = await user.getPlaylist();

        
        let fileInfos = [];
        
		await playlists.forEach(playlist => {
            fileInfos.push({
                id: playlist.id,
                playlist_id: playlist.playlist_id,
                playlist_title: playlist.playlist_title,
                playlist_status: playlist.playlist_status,
                dateTime: playlist.createdAt,
            });
        });
        res.status(200).send(fileInfos);
    })
}

const getPlaylist = (req, res)=>{
    const {user_id, access_key, playlist_id} = req.query;

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
        if(user.access_key!=access_key){
            return res.status(400).send({
                message: "Invalid User Key."
            });
        }

        const items = await Video.findAll({
            where: { playlist_id }
        })

        let fileInfos = [];

		await items.forEach(video => {
            fileInfos.push({
                id: video.id,
                video_id: video.video_id,
                meta_title: video.meta_title,
                meta_image: video.meta_image,
                meta_keyword: video.meta_keyword,
                meta_description: video.meta_description, 
                playlist_id: video.playlist_id,
                dateTime: video.createdAt,
            });
        });

        res.status(200).send(fileInfos);
    })
}

const getPublicPlaylist = (req, res)=>{
    const {user_id, access_key, playlist_id} = req.query;

    User.findOne({
        where: {
            user_id: user_id
        }
    }).then(async user=>{

        console.log(user.id)

        if(!user){
            return res.status(404).send({
                message: "User Not Found."
            });
        }
        if(user.access_key!=access_key){
            return res.status(400).send({
                message: "Invalid User Key."
            });
        }

        const one = await Playlist.findOne({
            where: {
                playlist_id,
            }
        })

        if (one.userId == user.id) {
            const items = await Video.findAll({
                where: { 
                    playlist_id,
                }
            })
    
            let fileInfos = [];
    
            await items.forEach(video => {
                fileInfos.push({
                    id: video.id,
                    video_id: video.video_id,
                    meta_title: video.meta_title,
                    meta_image: video.meta_image,
                    meta_keyword: video.meta_keyword,
                    meta_description: video.meta_description, 
                    dateTime: video.createdAt,
                });
            });
            res.status(200).send(fileInfos);
        } else if (one.playlist_status == 1) {
            const items = await Video.findAll({
                where: { 
                    playlist_id,
                }
            })
    
            let fileInfos = [];
    
            await items.forEach(video => {
                fileInfos.push({
                    id: video.id,
                    video_id: video.video_id,
                    meta_title: video.meta_title,
                    meta_image: video.meta_image,
                    meta_keyword: video.meta_keyword,
                    meta_description: video.meta_description, 
                    dateTime: video.createdAt,
                });
            });
            res.status(200).send(fileInfos);
        } else {
            res.status(200).send({
                message: "cannot_access"
            });
        }
    })
}

module.exports = {
    addPlaylist,
    removePlaylist,
    changePlaylist,
    getAllPlaylist,
    getPlaylist,
    getPublicPlaylist,
}