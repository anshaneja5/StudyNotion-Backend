const mailSender = require("../utils/mailSender");
const {contactUsEmail} = require("../mail/templates/contactUs");

exports.contactUs = async (req,res)=>{
    try {
        const {fName,lName,email,phoneNum,message,countryCode} = req.body;
        await mailSender(
            email,
            "StudyNotion",
            contactUsEmail(email,fName,lName,message,phoneNum,countryCode)
        );
        return res.json({
            success: true,
            message: "Email send successfully",
          })
    } catch (error) {
        return res.json({
            success: false,
            message: "Something went wrong...",
            error:error.message
        })
    }
}