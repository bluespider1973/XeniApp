const controller = require('../controllers/receivedPlaylist.controller');

module.exports = function (app) {
    app.post("/api/received/addPlaylist", controller.addPlaylist);
    app.get("/api/received/getAllPlaylist", controller.getAllPlaylist);
    app.post("/api/received/removePlaylist/:id", controller.removePlaylist);
    
    app.post("/api/changePlaylist/:id", controller.changePlaylist);
    app.get("/api/getPlaylist", controller.getPlaylist);
    app.get("/api/getPublicPlaylist", controller.getPublicPlaylist);
};
