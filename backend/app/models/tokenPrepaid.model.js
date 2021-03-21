module.exports = (sequelize, Sequelize) => {
    const TokenPrepaid = sequelize.define("token_prepaid", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        code: {
            type: Sequelize.STRING,
        },
        nr_tokens: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        used: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
    });

    return TokenPrepaid;
};