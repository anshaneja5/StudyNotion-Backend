const mongoose = require("mongoose");
const ratingAndReviewSchema = new mongooose.Schema({
  user: {
    type: mongooose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
    trim:true;
  },
});

module.exports=mongoose.model("RatingAndReview",ratingAndReviewSchema);