const PPTX = require('nodejs-pptx');

const add_new_slide = async (path, filename, new_path)=>{

    console.log( "add_new_slide filename=" + filename);
    let pptx = new PPTX.Composer();
    
    const ppt_path = path;
    let fnames = filename.split('.');

    console.log( "add_new_slide fnames=" + fnames);
    if( fnames.length >= 2){
        let extra_filename = fnames[ fnames.length - 2];
        let extra_fnames = extra_filename.split( "_");
    	console.log( "add_new_slide extra_filename=" + extra_filename);
    	console.log( "add_new_slide extra_fnames=" + extra_fnames);

        let efl = extra_fnames.length;
    	console.log( "add_new_slide efl=" + efl);

        if( extra_fnames[ efl-1] == "changed"){
            extra_fnames[ efl-1] += "_1";
        }else if( !isNaN(extra_fnames[ efl-1]) && extra_fnames[ efl-2] == "changed"){
            extra_fnames[ efl-1] = ( + extra_fnames[efl-1] + 1) + "";
        }else{
            extra_fnames[ efl-1] += "_changed";
        }
        fnames[ fnames.length-2] = extra_fnames.join( "_");

        var changed_filename = fnames.join( ".");
    	console.log( "add_new_slide changed_filename=" + changed_filename);
        try{
            // Read the ppt.
            const d = new Date();
            // const json = await pptx2json.toJson(ppt_path+"/"+filename);
            load_file_name = ppt_path + "/" + filename;
    		console.log( "add_new_slide wait loading of ppt=" + load_file_name);
            await pptx.load( load_file_name);
    		console.log( "add_new_slide ppt loaded=" + load_file_name);
            // Add new slide

            await pptx.compose( async (pres) => {
                let newSlide = await pres.addSlide();
                newSlide.addText((text) => {
                    text.value(d.toString())
                        .x(100)
                        .y(100);
                });
                console.log("slidename", newSlide.name);
              });
            // Save and overwrite the ppt
    		console.log( "add_new_slide new_path=" + new_path);
    		console.log( "add_new_slide changed_filename=" + changed_filename);
            load_file_name_changed = new_path + "/" + changed_filename;
            await pptx.save( load_file_name_changed);
    		console.log( "add_new_slide saved=" + load_file_name_changed);

            return changed_filename;
        }catch( err){
    		console.log( "add_new_slide err=" + err.message);
            return "";
        }
    }else
    	console.log( "add_new_slide err=file name and extension error");
    	return "";
}

module.exports={
    add_new_slide,
}