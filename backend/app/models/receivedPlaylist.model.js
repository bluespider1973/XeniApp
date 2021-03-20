const moment = require('moment');

module.exports = (sequelize, Sequelize) => {
    const ReceivedPlaylist = sequelize.define("received_playlist", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true
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

    return ReceivedPlaylist;
};