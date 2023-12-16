const User = require("../models/User");
const Profile = require("../models/Profile");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

exports.updateProfile = async (req,res)=>{
    try {
        const {gender="",about="",contactNumber="",dateOfBirth=""}=req.body;
        const id=req.user.id; //user id already present in req as added in middleware auth
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionDetails;
        const profileDetails = await Profile.findById(profileId); //did this as profile was already marked null before, which means we only had to update it here
        profileDetails.gender=gender;
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;
        profileDetails.dateOfBirth=dateOfBirth;
        //after updating successfully, we'll just save it in DB
        await profileDetails.save();
        // Find the updated user details
        const updatedUserDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()
        return res.json({
        success: true,
        message: "Profile updated successfully",
        updatedUserDetails,
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:`Profile Cant be Created ${error.message}`
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

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Cannot Update profile picture ${error.message}`,
      })
    }
};
  
exports.getUserDetails = async (req, res) => {
	try {
		const id = req.user.id;
		const userDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};