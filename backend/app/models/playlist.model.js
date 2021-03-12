const moment = require('moment');

module.exports = (sequelize, Sequelize) => {
    const Playlist = sequelize.define("playlist", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true            
        },
        playlist_id: {
            type: Sequelize.STRING,
        },
        playlist_title: {
            type: Sequelize.STRING,
        },
        playlist_status: {
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

    return Playlist;
};