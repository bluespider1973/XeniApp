const { authJwt, verifyParams } = require("../middleware");
const controller = require('../controllers/image.controller');

module.exports = function (app) {
    app.post("/api/image/uploadImage/:user_id/:access_key", controller.uploadImage);
    app.post("/api/image/removeImage/:image_id", [verifyParams.getImageFileList], controller.removeImage);
    app.get("/api/image/getImageFile", [verifyParams.getImageFileList], controller.getImageFileList);
    app.get("/api/image/getAllImageFile", controller.getAllImageFileList);
    app.get("/api/image/getImageFile/:image_id", [verifyParams.imageDownload], controller.download);
    app.get("/api/image/rotateImage/:image_id", [verifyParams.rotateImage], controller.rotateImage);
    app.post("/api/image/addImageDescription/:image_id", controller.addImageDescription);
    app.get("/api/image/getImageHistory/:image_id", [verifyParams.getImageFileList], controller.getImageHistory);
};
