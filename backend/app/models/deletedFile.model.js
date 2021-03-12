module.exports = (sequelize, Sequelize) => {
    const DeletedFile = sequelize.define("deleted_file", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true            
        },
        file_name: {
            type: Sequelize.STRING
        },
        thumb_name: {
            type: Sequelize.STRING
        },
        path: {
            type: Sequelize.STRING
        },
        image_id: {
            type: Sequelize.STRING,    
            unique: true
        },
        operation: {
            type: Sequelize.STRING
        },
        source_image_id: {
            type: Sequelize.STRING
        },
        origin_image_id:{
            type: Sequelize.STRING
        },
        type: {
            type: Sequelize.STRING
        }
    });

    return DeletedFile;
};