const controller = require('../controllers/video.controller');

module.exports = function (app) {
    app.post("/api/video/uploadVideo", controller.uploadVideo);
    app.post("/api/video/removeVideo/:id", controller.removeVideo);
    app.get("/api/video/getAllVideoList", controller.getAllVideoList);
};
