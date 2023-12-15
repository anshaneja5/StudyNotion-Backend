const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils.mailSender");
const {courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail");

//Capture the payment and initiate the razorpay order  -1
exports.capturePayment = async (req,res){
    const {course_id}=req.body;
    const userId=req.user.id;
    //validate id
    if(!course_id){
        return res.json({
            success:false,
            message:"Please provide valid Course ID"
        })
    }
    //validate course
    let course;
    try {
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:"Course Not Found"
            })
        }
        //check if user didnt already paid for the course
        const uid = new mongoose.Types.ObjectId(userId); //as userId was string, converted it to ID
        if(course.studentsEnrolled.includes(uid)){
            return res.json({
                success:false,
                message:"Student Already Enrolled"
            })
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
    //create Order   -2
    const amount = course.price;
    const currency = "INR";
    const options = {
        amount : amount*100,
        currency,
        receipt : Math.random(Date.now()).toString(); //Optional
        notes:{ //Optional
            courseId:course_id,
            userId,
        }
    }:

    try {
        //init the payment
        const paymentResponse = await instance.orders.create(options); //created Order
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:"INR",
            amount:paymentResponse.amount,
        })
    } catch (error) {
        return res.json({
            success:false,
            message:"Could not initiate order"
        })
    }
}

//verify signature of razorpay and server
exports.verifySignature = async (req,res){
    const webhookSecret="1234567890";
    const signature=req.headers("x-razorpay-signature"); //signature coming from razorpay, and it is hashed 
    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex"); //at the end this will have the converted webhooksecret using HMAC
    if(signature === digest){
        console.log("Payment is Authorised");
        //Perform Action
        const {courseId, userId}= req.body.payload.payment.entity.notes;
        try {
            //enter user id in course inside students enrolled
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {
                    $push:{
                        studentsEnrolled:userId,
                    }
                },
                {new:true}
            );
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Something Went Wrong"
                })
            }
            //enter course id in user id
            const enrolledStudent = await User.findOneAndUpdate(
                {_id:userId},
                {
                    $push:{
                        courses:courseId,
                    }
                },
                {new:true}
            );
            if(!enrolledStudent){
                return res.status(500).json({
                    success:false,
                    message:"Something Went Wrong"
                })
            }
            //send confirmation mail
            await mailSender(
                enrolledStudent.email,
                "Congratulations | StudyNotion",
                courseEnrollmentEmail(enrolledCourse.courseName,enrolledStudent.firstName),
            )
            return res.status(200).json({
                success:true,
                message:"Signature Verified and Course Added"
            })
        } catch (error) {
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"Invalid Request"
        })
    }
}