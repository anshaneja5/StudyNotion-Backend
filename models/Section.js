const mongoose = require("mongoose");
//Multiple Sections have multiple videos
const sectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
  },
  subSection: [
    {
      type: mongoose.Types.Schema.ObjectId,
      ref: "SubSection",
      required: true,
    },
  ],
});

module.exports = mongoose.model("Section", sectionSchema);
