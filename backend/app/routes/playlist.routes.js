const controller = require('../controllers/playlist.controller');

module.exports = function (app) {
    app.post("/api/addPlaylist", controller.addPlaylist);
    app.post("/api/removePlaylist/:id", controller.removePlaylist);
    app.get("/api/getAllPlaylist", controller.getAllPlaylist);
    app.get("/api/getPlaylist", controller.getPlaylist);
};
