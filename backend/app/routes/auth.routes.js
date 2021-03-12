const express = require ('express');
const { verifySignUp, authJwt, verifyParams } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
    
    app.post(
        "/api/auth/signup",
        [
            verifySignUp.checkDuplicateUsernameOrEmail,
            verifySignUp.checkRolesExisted
        ],
        controller.signup
    );

    app.post("/api/auth/signin", controller.signin);
    app.post("/api/auth/deregister", [authJwt.verifyToken], controller.deregister);
    app.post("/api/auth/verifyEmail", [verifyParams.checkParams], controller.verifyEmail);
    app.post("/api/auth/changePassword", [authJwt.verifyToken], controller.changePassword);
    app.post("/api/auth/forgotPassword", controller.forgotPassword);
    app.post("/api/auth/resetPassword", [verifyParams.checkParams], controller.resetPassword);
    app.post("/api/auth/resendVerifyEmail", [authJwt.verifyToken], controller.resendVerifyEmail);
    app.post("/api/auth/getUserProfile", [authJwt.verifyToken], controller.getUserProfile);
};