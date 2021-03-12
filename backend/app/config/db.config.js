module.exports = {
    HOST: "localhost",
    USER: "foo",
    PASSWORD: "bar",
    DB: "logintemplate_db",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};