module.exports = (sequelize, Sequelize) => {
    const TokenAttempt = sequelize.define("token_attempt", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        count: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
    });

    return TokenAttempt;
};