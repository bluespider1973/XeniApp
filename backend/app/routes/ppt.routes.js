const { authJwt, verifyParams } = require("../middleware");
const controller = require('../controllers/ppt.controller');

module.exports = function (app) {
    app.post("/api/ppt/uploadPPT/:user_id/:access_key", controller.uploadPPT);
    app.get("/api/ppt/getPPTFile", [verifyParams.getImageFileList], controller.getPPTFileList);
    app.get("/api/ppt/getPPTFile/:ppt_id", [verifyParams.imageDownload], controller.download);
    app.get("/api/ppt/getPPTHistory/:ppt_id", [verifyParams.getImageFileList], controller.getPPTHistory);
    app.get("/api/ppt/addNewSlidePPT/:ppt_id", [verifyParams.getImageFileList], controller.addNewSlidePPT);
};
