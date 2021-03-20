const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

// var corsOption = {
//     origin:"http://localhost/3010"
// };

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const db=require('./app/models');
const Role = db.role;

global.__basedir = __dirname;

// db.sequelize.sync({force: true}).then(()=>{
//     console.log("Drop and Resync Db");
//     initial();
// })

app.get('/', (req,res)=>{
    res.json({message:"Welcome to My Demo. asdf"});
})

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/service.routes')(app);
require('./app/routes/image.routes')(app);
require('./app/routes/ppt.routes')(app);
require('./app/routes/video.routes')(app);
require('./app/routes/playlist.routes')(app);
require('./app/routes/receivedPlaylist.routes')(app);

dotenv.config();

const PORT = process.env.PORT || 3030;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
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