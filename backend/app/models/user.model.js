module.exports = (sequelize, Sequelize)=>{
    const User = sequelize.define("users", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true            
        },
        username: {
            type: Sequelize.STRING 
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        user_id: {
            type: Sequelize.STRING
        },
        access_key: {
            type: Sequelize.STRING
        },
        verified_email: {
            type: Sequelize.STRING,
            defaultValue: 'none'
        },
        nr_tokens:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    });
    return User;
}