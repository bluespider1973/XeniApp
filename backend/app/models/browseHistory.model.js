module.exports = (sequelize, Sequelize) => {
    const BrowseHistory = sequelize.define("browse_history", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true            
        },
        video_id: {
            type: Sequelize.STRING
        },
    });

    return BrowseHistory;
};