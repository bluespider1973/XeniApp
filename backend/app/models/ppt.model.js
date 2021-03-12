module.exports = (sequelize, Sequelize) => {
    const PPT = sequelize.define("ppt", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true            
        },
        file_name: {
            type: Sequelize.STRING
        },
        path: {
            type: Sequelize.STRING
        },
        ppt_id: {
            type: Sequelize.STRING,
            unique: true
        },
        operation: {
            type: Sequelize.STRING
        },
        source_ppt_id: {
            type: Sequelize.STRING
        },
        origin_ppt_id:{
            type: Sequelize.STRING
        }
    });

    return PPT;
};