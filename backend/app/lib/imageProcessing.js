const Jimp = require('jimp');
const fs = require('fs');
const pth = require('path');

const makeThumb =async (path, filename, new_path)=>{
    let fnames = filename.split('.');

    if(fnames.length>=2){
        fnames[fnames.length-2]+="_thumb";
        var thumb_name=fnames.join(".");
    }
    else return "";
    // Read the image.
    const image = await Jimp.read(path+"/"+filename);
    // Resize the image to width 150 and heigth 150.
    await image.resize(150, Jimp.AUTO);
    // Save and overwrite the image
    await image.writeAsync(new_path+"/"+thumb_name);

    return thumb_name;
}

const deleteImage = async (path, filename, thumb_name) => {
    try{
        fs.unlinkSync(pth.normalize(path+"/"+filename));
        fs.unlinkSync(pth.normalize(path+"/"+thumb_name));
        return true;
    }catch (err){
        console.log("image file remove error", err);
        return false;
    }
}

const rotate_90_clock = async (path, filename, new_path)=>{
    
    const image_path = path;
    let fnames = filename.split('.');

    if(fnames.length>=2){
        let extra_filename = fnames[fnames.length-2];
        let extra_fnames = extra_filename.split("_");
        
        let efl = extra_fnames.length;
        
        if(extra_fnames[efl-1]=="rotate90clock"){
            extra_fnames[efl-1]+="_1";
        }else if(!isNaN(extra_fnames[efl-1]) && extra_fnames[efl-2]=="rotate90clock"){
            extra_fnames[efl-1]=(+extra_fnames[efl-1]+1)+"";
        }else{
            extra_fnames[efl-1]+="_rotate90clock"
        }
        fnames[fnames.length-2] = extra_fnames.join("_");

        var rotated_filename=fnames.join(".");
        try{
            // Read the image.
            const image = await Jimp.read(image_path+"/"+filename);
            // Resize the image to width 150 and heigth 150.
            await image.rotate(-90);
            await image.crop(1, 0, image.getWidth()-2, image.getHeight()-2);
            // Save and overwrite the image
            await image.writeAsync(new_path+"/"+rotated_filename);
            return rotated_filename;
        }catch(err){
            return "";
        }
    }
    else return "";
}
module.exports={
    makeThumb,
    deleteImage,
    rotate_90_clock,
}