const { authJwt, verifyParams } = require("../middleware");
const service = require('../controllers/service.controller');

module.exports = function (app) {
    app.get('/api/execute_service', 
        [verifyParams.executeService],
        service.executeService
    );

    // app.get('/api/get_token_history',

    // )
};
