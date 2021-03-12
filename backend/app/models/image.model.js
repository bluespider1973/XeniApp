const moment = require('moment');

module.exports = (sequelize, Sequelize) => {
    const Image = sequelize.define("image", {
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
        origin_image_id: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        createdAt: {
            type: Sequelize.DATE,
            get: function() {
                let date = this.getDataValue('createdAt')
        
                if (moment(date, moment.ISO_8601, true).isValid()) {
                    return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss')
                } else {
                    return date
                }
            }
        }
    });

    return Image;
};