const util = require('util');
const multer = require('multer');

const Generate = require('../lib/generate');

const maxSize = 2000 * 1024 * 1024;

let storage = multer.diskStorage({

    destination: (req, file, cb)=>{
        const url = req.url;
        const fileType = url.split("/")[2];        
        let path = Generate.path(fileType, req.params.user_id);
        cb(null, path);
    },
    filename: (req, file, cb)=>{
        cb(null, `${req.fileId}_${file.originalname}`);
    }
})

let uploadFile = multer({
    storage: storage,
    limits: {fileSize: maxSize}
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;