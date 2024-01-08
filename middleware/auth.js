const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  //Checking Authentication
  try {
    const token =
      req.cookies.token || 
      req.header("Authorisation").replace("Bearer ", "") ||   //real spelling is Authorization, spelling mistake in whole project
      req.body.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "token missing",
      });
    }
    // verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET); //will return payload
      req.user = decode; //added decode ie payload to the request to access the id afterwords
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      message: "Something went wrong while verifying token",
    });
  }
};

exports.isStudent = (req, res, next) => {
  try {
    console.log(req);
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protect route for students you can not access it",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User Role is not Matching",
    });
  }
};

exports.isAdmin = (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protect route for Admins,you can not access it",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User Role is not Matching",
    });
  }
};

exports.isInstructor = (req, res, next) => {
  try {
    console.log(req);
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protect route for Instructor you can not access it",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User Role is not Matching",
    });
  }
};
