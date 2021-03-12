const { user } = require('../models');
const db = require('../models');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');

const User = db.user;

const checkParams = (req, res, next)=>{
    let { user_id, unique_id } = req.body;
    if(!user_id || !unique_id){
        res.status(400).send({message: "Bad Query"});
        return;
    }
    next();
}

const addTokensParams = (req, res, next)=>{
    let {user_id, nr_tokens, admin_key} = req.query;
    if(!user_id || !nr_tokens || !admin_key){
        res.status(400).send({message: "Bad Query"});
        return;
    }
    next();
}

const executeService = (req, res, next)=>{
    if(!req.query.server){
        res.status(400).send({message: "Bad Query"});
        return ;
    }
    switch(req.query.server){
        case 'get_weather':
            if(!req.query.user_id || !req.query.user_key || !req.query.city){
                res.status(400).send({message: "Bad Query"});
                return ;
            }
            break;
        case 'get_tokenHistory':
            if(!req.query.user_id){
                res.status(400).send({message: "Bad Query"});
                return;
            }
            break;
        default:
            res.status(400).send({message: "Bad Query"});
            return;
    }
    next();
}

const getImageFileList = (req, res, next)=>{
    let {user_id, user_key} = req.query;
    if(!user_id || !user_key){
        res.status(400).send({message: "Bad Query"});
        return;
    }
    next();
}

const imageDownload = (req, res, next)=>{
    let {user_id, user_key, type} = req.query;
    if(!user_id || !user_key || !type){
        res.status(400).send({message: "Bad Query"});
        return;
    }

    next();
}

const rotateImage = (req, res, next) =>{
    let {user_id, user_key, degree, clock} = req.query;
    if(!user_id || !user_key || !degree || !clock) {
        res.status(400).send({message: "Bad Query"});
        return;
    }
    next();    
}

const verifyParams = {
    checkParams: checkParams,
    addTokensParams: addTokensParams,
    executeService: executeService,
    getImageFileList: getImageFileList,
    imageDownload: imageDownload,
    rotateImage: rotateImage,
}
module.exports=verifyParams;
