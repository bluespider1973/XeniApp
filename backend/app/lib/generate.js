const mkdirp = require('mkdirp');

const accessKey=()=> {
    length = 40;
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const userId=(email)=>{
    const positioin = email.indexOf("@");
    var userId = email.substr(0,positioin);
    userId+="_";
    for(i = 0; i<9; i++)
    {
        userId+=Math.floor(Math.random() * 10);
    }
    return userId;
}

const path=(fileType, userId)=>{
    let date = new Date();
    date = date.toLocaleDateString('pt-br').split( '/' ).reverse( ).join( '/' );
    const path = __basedir + "/resources/static/assets/uploads/" + fileType + "/" + date + '/' + userId;
    mkdirp.sync(path);
    return path;
}

const key=()=>{
    length = 20;
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const Generate = {
    accessKey,
    userId,
    key,
    path,
}

module.exports=Generate;