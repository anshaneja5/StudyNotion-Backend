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
        ).populate("subSection");
        return res.status(200).json({
            success:true,
            message:"Sucessfully Created SubSection"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Un-Sucessfully Created SubSection"
        })
    }
}

exports.updateSubSection = async (req,res)=>{
    try {
        const { sectionId, subSectionId, title, description } = req.body
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
          return res.status(404).json({
            success: false,
            message: "SubSection not found",
          })
        }
        //If they are not undefined then update it
        if (title !== undefined) {
          subSection.title = title
        }
        if (description !== undefined) {
          subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
          const video = req.files.video
          const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME
          )
          subSection.videoUrl = uploadDetails.secure_url
          subSection.timeDuration = `${uploadDetails.duration}` //finding duration from returned object of cloudinary
        }
        //Save in DB 
        await subSection.save()
        // find updated section and return it
        const updatedSubSection = await Section.findById(sectionId).populate("subSection")
        console.log("updated section", updatedSubSection)
    
        return res.json({
          success: true,
          message: "Section updated successfully",
          data: updatedSubSection,
        })
      } catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the section",
        })
      }
}

exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      //First delete subsection from Section, as section has its id ref
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      //then delete from subsection
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
      // find updated section and return it
      // const updatedSection = await Section.findById(sectionId).populate("subSection");
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
        // data: updatedSection,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
}