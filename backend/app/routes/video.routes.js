const controller = require('../controllers/video.controller');

module.exports = function (app) {
    app.post("/api/video/uploadVideo", controller.uploadVideo);
    app.post("/api/video/addPlaylistIds", controller.addPlaylistIds);
    app.post("/api/video/getPlaylistIds", controller.getPlaylistIds);
    app.post("/api/video/removeVideo/:id", controller.removeVideo);
    app.post("/api/video/changeVideoGroup/:id", controller.changeVideoGroup);
    app.get("/api/video/getAllVideoList", controller.getAllVideoList);
};
