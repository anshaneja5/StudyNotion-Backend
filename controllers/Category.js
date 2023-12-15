const Category = require("../models/Category");
const RatingAndReview = require("../models/RatingAndReview");

exports.createCategory = async (req,res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });
    return res.status(200).json({
      success: true,
      message: "Category created sucessfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Cannot Create Category ${err.message}`,
    });
  }
};

exports.showAllCategory = async (req,res) => {
  try {
    const allCategory = await Category.find({ name: true, description: true }); //both name and desc should be present
    return res.status(200).json({
      success: true,
      message: "Category fetched sucessfully",
      allCategory,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Cannot Show Category ${err.message}`,
    });
  }
};

exports.categoryPageDetails = async (req,res)=>{
  try {
    const {categoryId} = req.body;
    //find selected category from db
    const selectedCategory = await Category.findById(categoryId).populate(courses).exec();
    //validation
    if(!selectedCategory){
      return res.status(404).json({
        success:false,
        message:"Courses not Found"
      })
    }
    //now get courses of different category
    const differentCategories = await Category.find({
      _id : {$ne : categoryId}         //find all the courses not equal to category id
    }).populate(courses).exec();
    //now get top selling courses
    
  } catch (error) {
    
  }
}