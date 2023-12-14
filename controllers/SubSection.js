const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const uploadImageToCloudinary = require("../utils/imageUploader");

exports.createSubSection = async (req,res)=>{
    try {
        const { title, timeDuration, description, sectionId} = req.body;
        const video = req.files.videoFile;
        if(!title || !timeDuration || !description || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME); //this is uploading video only. i have to change name of the function in utils
        const SubSectionDetails = await SubSection.create(
            {
                title:title,
                timeDuration:timeDuration,
                description:description,
                videoUrl:uploadDetails.secure_url
            }
        ) 
        const updatedSection = await Section.findByIdAndUpdate(
            { _id :sectionId },
            {
                $push:{
                    subSection:SubSectionDetails._id
                }
            },
            { new:true}
        )
        return res.status(200).json({
            success:true,
            message:"Sucessfully Created SubSection"
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Un-Sucessfully Created SubSection"
        })
    }
}

exports.updateSubSection = async (req,res)=>{
    try {
        const { title, timeDuration, description, subSectionId} = req.body;
        const video = req.files.videoFile;
        //validation
        if(!title || !timeDuration || !description || !subSectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        const updatedSubSection = await SubSection.findByIdAndUpdate(subSectionId,{title:title,timeDuration:timeDuration,description:description,videoUrl:uploadDetails.secure_url},{new:true});
        return res.status(200).json({
            success:true,
            message:"SubSection Updated Sucessfully"
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"SUbSection Created Un-Sucessfully"
        })
    }
}

exports.deleteSubSection = async (req,res)=>{
    try {
        const {SubSectionId}=req.params;
        await SubSection.findByIdAndDelete(SubSectionId);
        return res.status(200).json({
            success:true,
            message:"SubSection Deleted Sucessfully"
        }
    }
    catch(error){
        return res.status(200).json({
            success:false,
            message:"SubSection Deleted Un-Sucessfully"
        })
    } 
}