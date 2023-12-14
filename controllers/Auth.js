const mongoose = require("mongoose");
const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otpgenerator");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender"); 

require("dotenv").config();

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUserPresent = await User.findOne({ email });
    //Check if user already registered 
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }
    //If not then generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    //Check if OTP is Unique or not
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };
    //OTP entry in DB
    const otpBody = OTP.create(otpPayload);
    res.status(200).json({
      success: true,
      message: "OTP sent Sucessfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error Occured in Generating OTP ${err.message}`,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      otp,
      accountType,
      contactNumber,
    } = req.body;
    //Validate if everything came in req body or not
    if (
      !firstName ||
      !lastName ||
      !email ||
      !confirmPassword ||
      !password ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are Required",
      });
    }
    //Validate Password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords don't match",
      });
    }
    const existingUser = await findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already Registered",
      });
    }
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1); //To Get the topmost otp after sorting in descending order
    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not Found",
      });
    } else if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    //Hashing Password
    const hashedPassword = await bcrypt.hash(password, 10); //10 is number of rounds;
    //Created profile so to pass in User schema
    const profileDetails = await Profile.create({
      gender: null,
      about: null,
      contactNumber: null,
      dateOfBirth: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      confirmPassword,
      otp,
      accountType,
      contactNumber,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`, //DiceBear api will convert Random Name to RN img
      additionalDetails: profileDetails._id,
    });
    return res.status(200).json({
      success: true,
      message: "User Registered Sucessfuly",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Enter all fields",
      });
    }
    const user = await User.findOne({ email });
    //If user dont exist
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User does not exist",
      });
    }
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      //Created JWT Token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token, 
        user,
        message: "User Logged In",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: `Password don't match`,
      });
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: `Error occured in logging in ${err.message}`,
    });
  }
};

async function sendChangedPWDMail(email) {
  try {
    const mailResponse = await mailSender(
      email,
      "Password SN"
      "Password Changed Sucessfully -  StudyNotion",
    );
  } catch (err) {
    console.log("Error in Password Changed Mail " ,error);
  }
} 

exports.changePassword = async (req, res) => {
  try{
    const {email,oldPassword,newPassword,confirmNewPassword};
    if( !email || !oldPassword || !newPassword, !confirmNewPassword){
      return res.status(400).json({
        success:false,
        message:"Enter all fields"
      })
    }
    if(newPassword == confirmNewPassword){
      return res.status(400).json({
        success:false,
        message:"New Password should be other than old password"
      })
    }
    const user = await User.findOne({email});
    user.password=await bcrypt.hash(newPassword,10);
    sendChangedPWDMail(email);
    return res.status(200).json({
      success:true,
      message:"Changed Password Sucessfully"
    })
  }
  catch(err){
    return res.status(400).json({
      success:true,
      message:"Changed Password UnSucessfully"
    })
  }
}