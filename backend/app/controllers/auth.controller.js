const db = require('../models');
const config = require('../config/auth.config');
const { Generate, sendSimpleMail } = require('../lib');
const User = db.user;
const Role = db.role;
const KeyTemporary = db.keyTemporary;
const TokenHistory = db.tokenHistory;

const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const { user } = require('../models');

exports.signup = (req, res) => {
    console.log("register:", req.body);
    const user_id = Generate.userId(req.body.email)
    const reset_key = Generate.key();
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        user_id: user_id,
        access_key: Generate.accessKey(),
    }).then(user => {
        if (req.body.roles) {
            Role.findAll({
                where: {
                    name: {
                        [Op.or]: req.body.roles
                    }
                }
            }).then(roles => {
                user.setRoles(roles).then(() => {
                    res.send({ message: "User was registered successfully." });
                });
            })
        } else {
            user.setRoles([1]).then(() => {
                res.send({ message: "User was registered successfully." });
            });
        }
        sendSimpleMail({
            username: req.body.username, email: req.body.email, user_id: user_id,
            reset_key: reset_key, type: "verify_email"
        },
            function (err, val) {
                if (val == "success") {
                    KeyTemporary.update({ used: 1 },
                        { where: { id_dest: user_id, used: 0, operation: "verify_email" } }
                    ).then(tk => {
                        KeyTemporary.create({
                            key_str: reset_key,
                            operation: "verify_email",
                            id_dest: user_id,
                            used: 0
                        }).then(kt => {
                            console.log("key temporary created successfully");
                        }).catch(err => {
                            console.log("failed A to create key temporary.");
                        })
                    }).catch(err => {
                        console.log("failed B to create key temporary.");
                    })
                }
            });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    })
}

exports.getUserProfile = (req, res)=>{
    User.findOne({
        where: {
            id: req.userId,
        }
    }).then(user => {
        if(!user){
            return res.status(404).send({
                message: "User Not Found"
            });            
        }
        
        var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24hrs
        });

        var authorities = [];
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                authorities.push("ROLE_" + roles[i].name.toUpperCase());
            }
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                roles: authorities,
                user_id: user.user_id,
                access_key: user.access_key,
                verified_email: user.verified_email,
                nr_tokens: user.nr_tokens,
                accessToken: token
            });
        });
    })
}

exports.signin = (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not Found." });
        }
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password."
            });
        }

        var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24hrs
        });

        var authorities = [];
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                authorities.push("ROLE_" + roles[i].name.toUpperCase());
            }
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                roles: authorities,
                user_id: user.user_id,
                access_key: user.access_key,
                verified_email: user.verified_email,
                nr_tokens: user.nr_tokens,
                accessToken: token
            });
        });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    })
}

exports.changePassword = (req, res) => {

    User.findByPk(req.userId).then(user => {
        var passwordIsValid = bcrypt.compareSync(req.body.oldPassword, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Old Password" });
        }
        let newpassword = bcrypt.hashSync(req.body.newPassword, 8);

        User.update({ password: newpassword }, { where: { email: user.email } })
            .then(u => {
                res.status(200).send({ message: "User Password was changed Successfully." });
            }).catch(err => {
                res.status(500).send({ message: err.message });
            });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    })
}

exports.deregister = (req, res) => {
    User.findByPk(req.userId).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User NOt Found." });
        }
        if (user.email !== req.body.email) {
            return res.status(401).send({ message: "Invalid User Email." });
        }
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password" });
        }

        user.destroy().then(u => {
            res.status(200).send({ message: "User was deleted successfully." });
        }).catch(err => {
            res.status(500).send({ message: err.message });
        })

    }).catch(err => {
        res.status(500).send({ message: err.message });
    })
}

exports.forgotPassword = (req, res) => {
    const reset_key = Generate.key();

    User.findOne({
        where: { email: req.body.email }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not Found." });
        }

        sendSimpleMail({ username: user.username, email: user.email, user_id: user.user_id, reset_key: reset_key, type: "reset_password" }, function (err, val) {
            console.log(err, val);
            if (val == "error") {
                return res.status(500).send({ message: "Failed to send reset email." });
            } else if (val == "success") {
                KeyTemporary.update({ used: 1 }, { where: { id_dest: user.user_id, used: 0, operation: "reset_password", } }).then(kt => {
                    KeyTemporary.create({
                        key_str: reset_key,
                        operation: "reset_password",
                        id_dest: user.user_id,
                        used: 0
                    }).then(kt => {
                        res.status(200).send({ message: "An Email to Reset Password was sent successfully." })
                    }).catch(err => {
                        console.log(err);
                        res.status(500).send({ message: "Failed to send an email to reset password." });
                    })
                }).catch(err => {
                    res.status(500).send({ message: err.message });
                })
            }
        });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    })
}

exports.verifyEmail = (req, res) => {
    const { user_id, unique_id } = req.body;
    User.findOne({
        where: {
            user_id: user_id
        }
    }).then(user=>{
        if(!user){
            return res.status(404).send({
                message: "Invalid User Id"
            });
        }
        if(user.verified_email=="yes"){
            return res.status(400).send({
                message: "Your email is already verified."
            })
        }
        KeyTemporary.findOne({
            where: {
                id_dest: user_id,
                operation: "verify_email",
                key_str: unique_id
            }
        }).then(keyTemp => {
            if (!keyTemp) {
                return res.status(404).send({ message: "Verify Record Not Found." });
            }
            if (keyTemp.used == 1) {
                return res.status(400).send({ message: "Old Verify Code." })
            }
            keyTemp.update({ used: 1 }).then((kt) => {
                user.update(
                    { verified_email: "yes" }
                ).then(u => {
                    user.update({ nr_tokens: user.nr_tokens + 100 }).then(async result => {
                        const tokenHistory =  await TokenHistory.create({
                            service: "Verify Email",
                            spent_tokens: 100,
                            current_tokens: user.nr_tokens
                        });
                        user.addTokenHistory(tokenHistory).then(() => {
                            res.status(200).send({ message: "Your email was verified and you received 100 tokens." });
                        });
                    })
                }).catch(err => {
                    res.status(500).send({ message: err.message });
                })
            }).catch(err => {
                res.status(500).send({ message: err.message });
            })
        }).catch(err => {
            res.status(500).send({ message: err.message });
        })
    }).catch(err=>{
        res.status(500).send({
            message: err.message
        })
    })
}

exports.resetPassword = (req, res) => {
    const { password, user_id, unique_id } = req.body;

    console.log(password, user_id, unique_id);

    KeyTemporary.findOne({
        where: {
            id_dest: user_id,
            operation: "reset_password",
            key_str: unique_id
        }
    }).then(keyTemp => {
        if (!keyTemp) {
            return res.status(404).send({ message: "Reset Record Not Found." });
        }

        if (keyTemp.used == 1) {
            return res.status(400).send({ message: "Old Reset Password Code." });
        }
        keyTemp.update({ used: 1 }).then(() => {
            User.update(
                { password: bcrypt.hashSync(password, 8) },
                {
                    where: { user_id: user_id }
                }).then(user => {
                    if (!user) {
                        res.status(404).send({ message: "Invalid User Id." });
                    } else {
                        res.status(200).send({ message: "Success Reset password." });
                    }
                }).catch(err => {
                    res.status(500).send({ message: "pass-update" + err.message });
                })
        }).catch(err => {
            res.status(500).send({ message: "key-update" + err.message });
        })
    }).catch(err => {
        res.status(500).send({ message: "key-find" + err.message });
    })
}

exports.resendVerifyEmail=(req, res)=>{
    User.findOne({
        where: {
            id: req.userId
        }
    }).then(user=>{
        if(!user){
            return res.status(404).send({
                message: "User Not Found."
            })
        }

        if(user.verified_email!="none"){
            return res.status(400).send({
                message: "Your email is already verified."
            })
        }

        const reset_key = Generate.key();
        KeyTemporary.update({ used: 1 },
            { where: { id_dest: user.user_id, used: 0, operation: "verify_email" } }
        ).then(keyTemp => {
            KeyTemporary.create({
                key_str: reset_key,
                operation: "verify_email",
                id_dest: user.user_id,
                used: 0
            }).then(kt => {
                console.log("key temporary created successfully");

                sendSimpleMail({
                    username: user.username, email: user.email, user_id: user.user_id,
                    reset_key: reset_key, type: "verify_email"
                }, function (err, val) {
                    if (val == "success") {
                        res.status(200).send({
                            message: "Verification Email was sent successfully"
                        })                 
                    }else{
                        console.log("resend email was failed", err);
                        res.status(500).send({
                            message: "Send us an email at help@videndaai.com for account verification, with subject error code = email-server-001"
                        })
                    }
                });
            }).catch(err => {
                console.log("failed A to create key temporary.");
            })
            
        }).catch(err => {
            console.log("failed B to create key temporary.");
        })

    })
}