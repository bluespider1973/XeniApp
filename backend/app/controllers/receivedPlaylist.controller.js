const fs = require('fs');
const Jimp = require('jimp');
const CryptoJS = require('crypto-js');

const db = require('../models');
const {Generate, sendSimpleMail} = require('../lib');

const User = db.user;
const Playlist = db.playlist;
const ReceivedPlaylist = db.receivedPlaylist;
const PlaylistVideo = db.playlistVideo;
const Video = db.video;

var global_data = require('../tools/GlobalData');
const API_URL = global_data.back_end_server_ip + ':' + global_data.back_end_server_port + '/api/image/getImageFile/';


const addPlaylist = async(req, res)=>{
    const {user_id, access_key, playlist_url } = req.query;

    try{
        User.findOne({
            where: {
                user_id: user_id
            }
        }).then(async user => {
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

            const playlist_id = await Playlist.findOne({
                where: {
                    playlist_id: playlist_url
                }
            })

            if (!playlist_id) {
                return res.status(200).send({
                    message: "Invalid playlist Id.",
                });
            }


            const isSaved = await ReceivedPlaylist.findAll({
                where: {
                    playlistId: playlist_id.id
                }
            })

            if (isSaved.length > 0) {
                return res.status(200).send({
                    message: "cannotregister",
                });
            }


            const receivedPlaylist = await ReceivedPlaylist.create({
                playlistId : playlist_id.id
            });

            user.addReceivedPlaylist(receivedPlaylist).then(async result=>{
                res.status(200).send({
                    message: "success",
                });
            }).catch(err=>{
                res.status(500).send({
                    message: err.message
                })
            })
        }).catch(err => {
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

        const playlist = await ReceivedPlaylist.findOne({
            where: { playlistId: id }
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

/*
        const receivedPlaylist = await ReceivedPlaylist.findAll({
            include: [{model: Playlist, as: 'Playlist' }],
        })
*/
       // console.log(receivedPlaylist)

        let arr = [];

        const playlists = await user.getReceivedPlaylist();
        for (const item of playlists) {
            const a = await Playlist.findOne({
                where: {
                    id: item.playlistId
                }
            })

            const videos = await PlaylistVideo.findAll({
                where: {
                    playlistId: item.playlistId
                }
            })
            
            const user = await User.findOne({
                where: {
                    id: a.userId
                }
            })

            a.sender_name = user.username;
            a.createdAt = item.createdAt;
            a.videoCount = Object.keys(videos).length;

            arr.push(a);
        }

        let fileInfos = [];

		await arr.forEach(playlist => {
            fileInfos.push({
                id: playlist.id,
                playlist_id: playlist.playlist_id,
                playlist_title: playlist.playlist_title,
                playlist_status: playlist.playlist_status,
                dateTime: playlist.createdAt,
                sender_name: playlist.sender_name,
                video_count: playlist.videoCount,
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

        const playlist = await Playlist.findOne({
            include: [{model: PlaylistVideo, as: 'PlaylistVideo', include: [Video] }],
            where: { playlist_id }
        })

        var video_arr = [];
        playlist.PlaylistVideo.forEach(item => {
            video_arr.push(item.video);
        })

        let fileInfos = [];

		await video_arr.forEach(video => {
            fileInfos.push({
                id: video.id,
                video_id: video.video_id,
                meta_title: video.meta_title,
                manual_title: video.manual_title,
                meta_image: video.meta_image,
                meta_keyword: video.meta_keyword,
                meta_description: video.meta_description,
                manual_description: video.manual_description,
                meta_restriction_age: video.meta_restriction_age,
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

        const playlist = await Playlist.findOne({
            include: [{model: PlaylistVideo, as: 'PlaylistVideo', include: [Video] }],
            where: { playlist_id }
        })


        let datalength = (!!playlist) ? Object.keys(playlist).length : 0;

        if (datalength === 0) {
            return res.status(200).send({
                message: "cannot_access"
            });
        }


        if (playlist.userId == user.id) {
            var video_arr = [];
            playlist.PlaylistVideo.forEach(item => {
                video_arr.push(item.video);
            })

            let fileInfos = [];

            await video_arr.forEach(video => {
                fileInfos.push({
                    id: video.id,
                    video_id: video.video_id,
                    meta_title: video.meta_title,
                    manual_title: video.manual_title,
                    meta_image: video.meta_image,
                    meta_keyword: video.meta_keyword,
                    meta_description: video.meta_description,
                    manual_description: video.manual_description,
                	meta_restriction_age: video.meta_restriction_age,
                    playlist_id: video.playlist_id,
                    dateTime: video.createdAt,
                });
            });

            res.status(200).send(fileInfos);
        } else if (playlist.playlist_status == 1) {
            var video_arr = [];
            playlist.PlaylistVideo.forEach(item => {
                video_arr.push(item.video);
            })

            let fileInfos = [];

            await video_arr.forEach(video => {
                fileInfos.push({
                    id: video.id,
                    video_id: video.video_id,
                    meta_title: video.meta_title,
                    meta_image: video.meta_image,
                    meta_keyword: video.meta_keyword,
                    meta_description: video.meta_description,
                	meta_restriction_age: video.meta_restriction_age,
                    playlist_id: video.playlist_id,
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