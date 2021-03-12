module.exports = (sequelize, Sequelize) => {
    const TokenHistory = sequelize.define("token_history", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true            
        },
        service: {
            type: Sequelize.STRING
        },
        spent_tokens: {
            type: Sequelize.INTEGER
        },
        current_tokens: {
            type: Sequelize.INTEGER
        }
    });

    return TokenHistory;
};