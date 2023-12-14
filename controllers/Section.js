const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res)=>{
    try{
        //data input from req body
        const {sectionName, courseId} = req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const newSection = await Section.create({sectionName});
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            { _id : courseId},
            {
                $push:{
                    courseContent:newSection._id;
                }
            },
            { new:true}
        ).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        }).exec();
        return res.status(200).json({
            success:true,
            message:"Section Created Sucessfully",
            updatedCourseDetails
        })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:"Section Created Un-Sucessfully"
        })
    }
}

exports.updateSection = async (req,res)=>{
    try {
        const {sectionName,sectionId}=req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName:sectionName},{new:true});
        return res.status(200).json({
            success:true,
            message:"Section Updated Sucessfully"
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Section Created Un-Sucessfully"
        })
    }
}

exports.deleteSection = async (req,res)=>{
    try {
        //considering sending sectionId in parameters
        const {sectionId}=req.params;
        await Section.findByIdAndDelete(sectionId);
        return res.status(200).json({
            success:true,
            message:"Section Deleted Sucessfully"
        })
    } catch (error) {
        return res.status(200).json({
            success:false,
            message:"Section Deleted Un-Sucessfully"
        })
    }
}