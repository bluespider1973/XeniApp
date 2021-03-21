const { authJwt, verifyParams } = require("../middleware");
const controller = require("../controllers/user.controller");
const service = require('../controllers/service.controller');

module.exports = function (app) {
    
    app.get("/api/user/all", controller.allAccess);

    app.get(
        "/api/user/user",
        [authJwt.verifyToken],
        controller.userBoard
    );

    app.get(
        "/api/user/mod",
        [authJwt.verifyToken, authJwt.isModerator],
        controller.moderatorBoard
    );

    app.get(
        "/api/user/admin",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.adminBoard
    );

    app.get(
        "/api/user/add_tokens",
        [verifyParams.addTokensParams, authJwt.areAdmin],
        service.addTokens
    );

    app.get(
        "/api/user/add_token_code",
        service.addTokenCode
    );
};
