const nodemailer=require('nodemailer');
const config=require('../config/email.config');

var transporter = nodemailer.createTransport({
    // service: 'gmail',
    service: "gmail",
    secure: true,
    pool: true,
    auth: {
      user: config.GMAIL_ADDRESS,
      pass: config.GMAIL_PASSWORD
    }
});

const sendSimpleMail = ({username, email, user_id, reset_key, type}, callback)=>{

    var html = `<h1>Dear ${username}</h1><p>`;
    var email_subject = 'Account';
    console.log("sendSimpleMail start for " + type);
    switch(type){
        case 'verify_email':
            html+=`Please verify your email address that we may use `
                    + ` to recover your lost password`
                    + ` by following this link `
                    + `<a href="${config.FRONTEND_URL}verifyemail?user_id=${user_id}&unique_id=${reset_key}">${config.FRONTEND_URL}verifyemail?user_id=${user_id}&unique_id=${reset_key}</a>`
            email_subject += ' - verify your email address';
            console.log(`${config.FRONTEND_URL}verifyemail?user_id=${user_id}&unique_id=${reset_key}">${config.FRONTEND_URL}verifyemail?user_id=${user_id}&unique_id=${reset_key}`);
            break;
        case 'reset_password':
            html+=`Please confirm that you want to change the password`
            + ` to the new one that you operated in the last minutes in a login form `
            + ` by following this link `
            + `<a href="${config.FRONTEND_URL}resetpassword/reset?user_id=${user_id}&unique_id=${reset_key}">${config.FRONTEND_URL}resetpassword/reset?user_id=${user_id}&unique_id=${reset_key}</a>`
            email_subject += ' - confirm new password';
            console.log(`${config.FRONTEND_URL}resetpassword/reset?user_id=${user_id}&unique_id=${reset_key}`);
            break;
        case 'image_upload':
            html+=`Image uploaded successfully. image_id: ${reset_key}`;
            email_subject = "Image  Upload Confirm";
            break;
        case 'image_rotate':
            html+=`Image rotated successfully. image_id: ${reset_key}`;
            email_subject = "Image Rotate Confirm";
            break;
        case 'add_new_slide':
            html+=`Add New Slide successfully. ppt_id: ${reset_key}`;
            email_subject = "Add New Slide Confirm";
            break;
        case 'ppt_upload':
            html+=`PPT uploaded successfully. ppt_id: ${reset_key}`;
            email_subject = "PPT  Upload Confirm";
            break;
    }
    html += `</p>`;

    var mailOptions = {
        from: config.GMAIL_ADDRESS,
        to: email,
        subject: email_subject,
        html: html,
    };

    transporter.sendMail(mailOptions, function(error, info){
         var val;
         if ( error) {
             val = "error";
             console.log("failed to send verify email a11 - " + error + " - " + info);
             console.log("credentials [" + config.GMAIL_ADDRESS + "] --> [" + config.GMAIL_PASSWORD + "]");
         } else {
             val = "success";
             console.log("send verify email successfully a12");
         }
         callback(error, val);
    });

}

module.exports = sendSimpleMail;