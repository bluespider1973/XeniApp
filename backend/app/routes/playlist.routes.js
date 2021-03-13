const controller = require('../controllers/playlist.controller');

module.exports = function (app) {
    app.post("/api/addPlaylist", controller.addPlaylist);
    app.post("/api/removePlaylist/:id", controller.removePlaylist);
    app.post("/api/changePlaylist/:id", controller.changePlaylist);
    app.get("/api/getAllPlaylist", controller.getAllPlaylist);
    app.get("/api/getPlaylist", controller.getPlaylist);
    app.get("/api/getPublicPlaylist", controller.getPublicPlaylist);
};
