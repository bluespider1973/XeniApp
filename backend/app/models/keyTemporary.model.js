module.exports = (sequelize, Sequelize) => {
    const KeyTemporary = sequelize.define("key_temporary", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true            
        },
        key_str: {
            type: Sequelize.STRING
        },
        operation: {
            type: Sequelize.STRING
        },
        id_dest: {
            type: Sequelize.STRING
        },
        used:{
            type: Sequelize.SMALLINT
        }
    });

    return KeyTemporary;
};