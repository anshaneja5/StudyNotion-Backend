const Tag = require("../models/Tags");
exports.createTag = async () => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });
    return res.status(200).json({
      success: true,
      message: "Tag created sucessfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `${err.message}`,
    });
  }
};

exports.showAllTags = async () => {
  try {
    const allTags = await Tag.find({ name: true, description: true }); //both name and desc should be present
    return res.status(200).json({
      success: true,
      message: "Tag fetched sucessfully",
      allTags,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `${err.message}`,
    });
  }
};
