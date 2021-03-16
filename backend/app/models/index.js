const config = require('../config/db.config');

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: 'mysql',
        operatorsAliases: 0,
        pool:{
            max : config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        },
        logging: false,
    }
)

const db = {};
db.Sequelize=Sequelize;
db.sequelize=sequelize;

db.user = require('./user.model')(sequelize, Sequelize);
db.role = require('./role.model')(sequelize, Sequelize);
db.keyTemporary = require('./keyTemporary.model')(sequelize, Sequelize);
db.tokenHistory = require('./tokenHistory.model')(sequelize, Sequelize);
db.image = require('./image.model')(sequelize, Sequelize);
db.deletedFile = require('./deletedFile.model')(sequelize, Sequelize);
db.ppt = require('./ppt.model')(sequelize, Sequelize);
db.video = require('./video.model')(sequelize, Sequelize);
db.playlist = require('./playlist.model')(sequelize, Sequelize);
db.playlistVideo = require('./playlistVideo.model')(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
    through: "user_roles",
    foreignKey: "roleId",
    otherKey: "userId"
});

db.user.belongsToMany(db.role, {
    through: "user_roles",
    foreignKey: "userId",
    otherKey: "roleId"
});

db.user.hasMany(db.tokenHistory, {
    as : 'TokenHistory',
});
db.tokenHistory.belongsTo(db.user);

db.user.hasMany(db.image, {
    as: "Image"
});
db.image.belongsTo(db.user);

db.user.hasMany(db.deletedFile, {
    as: "DeletedFile"
});
db.deletedFile.belongsTo(db.user);

db.user.hasMany(db.ppt, {
    as: 'PPT'
})
db.ppt.belongsTo(db.user);

db.user.hasMany(db.video, {
    as: "Video"
});
db.playlist.hasMany(db.video, {
    as: "Video"
})
db.video.belongsTo(db.user);
db.video.belongsTo(db.playlist);

db.user.hasMany(db.playlist, {
    as: "Playlist"
});
db.playlist.belongsTo(db.user);

// playlist_video
db.video.hasMany(db.playlistVideo, {
    as: "PlaylistVideo",
    onDelete: 'cascade',
    foreignKey: { allowNull: false },
    hooks: true
});
db.playlist.hasMany(db.playlistVideo, {
    as: "PlaylistVideo",
    onDelete: 'cascade',
    foreignKey: { allowNull: false },
    hooks: true
})
db.playlistVideo.belongsTo(db.video);
db.playlistVideo.belongsTo(db.playlist);

db.ROLES = ["user", "admin", "moderator"];

module.exports= db;