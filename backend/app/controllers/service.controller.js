const { default: axios } = require('axios');
const db=require('../models');
require('dotenv').config();

const User=db.user;
const TokenHistory=db.tokenHistory;

const WEATHER_API_URL = process.env.WEATHER_API_URL;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

exports.addTokens=(req, res)=>{
    User.findOne({
        where: {
            access_key: req.query.admin_key
        }
    }).then(admin=>{
        if(!admin){
            return res.status(403).send({
                message: "Invalid Admin Key"
            });
        }
        User.findOne({
            where: {
                user_id: req.query.user_id
            }
        }).then(user=>{
            if(!user){
                return res.status(404).send({
                    message: "User Not Found."
                })
            }
            user.update({nr_tokens: +req.query.nr_tokens+user.nr_tokens}).then(async (result)=>{
                const tokenHistory = await TokenHistory.create({
                    service: "Add Token",
                    spent_tokens:req.query.nr_tokens,
                    current_tokens: user.nr_tokens
                });

                user.addTokenHistory(tokenHistory).then(()=>{
                    res.status(200).send({
                        username: user.username,
                        user_id: user.user_id,
                        user_email: user.email,
                        nr_tokens: user.nr_tokens,
                        status: 'SUCCESS',
                        message: "User Information was updated successfully."
                    })
                }).catch(error=>{
                    res.status(500).send({message: error.message});
                });
            }).catch(error=>{
                res.status(500).send({message: error.message});
            })
        }).catch(error=>{
            res.status(500).send({message: error.message});
        })
    }).catch(error=>{
        res.status(500).send({message: error.message});
    })
}

exports.executeService = (req, res)=>{
    switch(req.query.server){
        case 'get_weather':
        	console.log( "get weather for city=" + req.query.city + " user_id=" + req.query.user_id);
            User.findOne({
                where: {
                    user_id: req.query.user_id
                }
            }).then(user=>{
                if(!user){
                    return res.status(404).send({message: "Invalid User Id."});
                }
                if(user.nr_tokens==0){
                    return res.status(400).send({message: "Not Enough Tokens."});
                }
                let axios_weather_url = `${WEATHER_API_URL}key=${WEATHER_API_KEY}&q=${req.query.city}`;
        		console.log( "get weater for=" + axios_weather_url);
        		//console.log( "get weater for=" + req.query.city + " from=" + WEATHER_API_URL);
                axios.get( axios_weather_url)
                    .then(response=>{
        				console.log( "get weater axios returned");
                        let weather = {
                            city: response.data.location.name,
                            weather: Math.round(response.data.current.temp_c) + " grades Celsius",
                            date: response.data.current.last_updated
                        }
                        user.update({nr_tokens: user.nr_tokens-1}).then(async r=>{
                            const tokenHistory = await TokenHistory.create({
                                service: "Get Weather",
                                spent_tokens: -1,
                                current_tokens: user.nr_tokens
                            });
                            user.addTokenHistory(tokenHistory).then(()=>{
                                res.status(200).send({
                                    data: {
                                        ...weather, cost: 1, tokens: user.nr_tokens
                                    },
                                    status: 'SUCCESS',
                                    message: "Get Weather Successfully."
                                })
                            }).catch(error=>{
                                res.status(500).send({message: error.message});
                            });
                        }).catch(error=>{
                            res.status(500).send({message: error.message});
                        });
                    }).catch(error=>{
                        res.status(400).send({message: error.message});
                    });
            }).catch(error=>{
                res.status(500).send({message: error.message});
            })
            break;
        case 'get_tokenHistory':
            User.findOne({
                where: {
                    user_id: req.query.user_id
                }
            }).then(user=>{
                user.getTokenHistory()
                    .then(th=>{
                        res.status(200).send({
                            data: th,
                            status: "SUCCESS",
                            message: ""
                        })
                    })
                    .catch(error=>{
                        res.status(500).send({message: error.message});
                    })
            })
            break;
        default:
            res.status(400).send("Invalid Server.");
    }

}