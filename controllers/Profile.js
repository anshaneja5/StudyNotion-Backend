const User = require("../models/User");
const Profile = require("../models/Profile");

exports.updateProfile = async (req,res)=>{
    try {
        const {gender,about="",contactNumber,dateOfBirth=""}=req.body;
        const id=req.user.id; //user id already present in req as added in middleware auth
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionDetails;
        const profileDetails = await Profile.findById(profileId); //did this as profile was already marked null before, which means we only had to update it here
        profileDetails.gender=gender;
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;
        profileDetails.dateOfBirth=dateOfBirth;
        //after updating successfully, we'll just save it in DB
        await profileDetails.save();
        return res.status(200).json({
            success:true,
            message:"Profile Updated Sucessfully"
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Profile Cant be Created"
        })
    }
}

//Delete Account

exports.deleteAccount = async (req,res)=>{
    try {
        const userId=req.user.id;
        const userDetails = await User.findById(userId);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        const profileId = userDetails.additionalDetails;
        await Profile.findByIdAndDelete(profileId);
        await User.findByIdAndDelete(userId);
        return res.status(200).json({
            success:true,
            message:"User deleted Sucessfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User couldnt be deleted"
        })
    }
}