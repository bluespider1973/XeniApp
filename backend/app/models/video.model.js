const moment = require('moment');

module.exports = (sequelize, Sequelize) => {
    const Video = sequelize.define("video", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        video_id: {
            type: Sequelize.STRING,
        },
        meta_title: {
            type: Sequelize.STRING,
        },
        manual_title: {
            type: Sequelize.STRING,
        },
        meta_image: {
            type: Sequelize.STRING,
        },
        meta_keyword: {
            type: Sequelize.STRING,
        },
        meta_description: {
            type: Sequelize.STRING
        },
        manual_description: {
            type: Sequelize.STRING,
        },
        meta_restriction_age: {
            type: Sequelize.STRING
        },
        playlist_id: {
            type: Sequelize.STRING,
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

    return Video;
};