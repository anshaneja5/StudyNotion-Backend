const Category = require("../models/Category");

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
