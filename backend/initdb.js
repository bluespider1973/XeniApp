
const db = require('./app/models');
const axios = require('axios');

const dotenv = require('dotenv');
const Role = db.role;

db.sequelize.sync({force: true}).then(()=>{
    console.log("Drop and Resync Db");
    initial();
})

function initial(){
    Role.create({
        id: 1,
        name: "user"
    });
    Role.create({
        id: 2,
        name: "moderator"
    });
    Role.create({
        id: 3,
        name: "admin"
    })
}

dotenv.config();
const PORT = process.env.PORT || 3030;
const username = process.env.ADMIN_NAME;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

console.log(username, email, password);
setTimeout(()=>{
    axios.post(`http://localhost:${PORT}/api/auth/signup`, {
        username: username,
        email: email,
        password: password,
        roles: ['admin', 'user']
    }).then(response=>{
        console.log(response.data);
    }).catch(error=>{
        console.log(error.message);
    });
}, 3000);