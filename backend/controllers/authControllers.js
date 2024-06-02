import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import { getResetPasswordTemplate } from "../utils/emailTemplate.js";
import ErrorHandler from "../utils/errorhandler.js";
import sendtoken from "../utils/sendtoken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import {upload_file,delete_file} from "../utils/cloudinary.js";



//Register User => /api/v1/register
export const registerUser = catchAsyncErrors(async(req,res,next)=> {
    const {name, email, password } = req.body;
 
    const user =await User.create({
        name, 
        email, 
        password,
    });
 
    sendtoken(user, 201, res);
});

//Login user => /api/v1/login
export const loginUser = catchAsyncErrors(async(req,res,next) => {
    
    const {email, password} = req.body;
    
    if(!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400));
    }

    //Find user in the database
    const user = await User.findOne({email}).select("+password");

    if(!user)
    {
        return next(new ErrorHandler('Invalid email or password', 401));
    }
    
    // check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    //must set like this when login if not the cookie cant pass through
    sendtoken(user, 200, res);
     
});

//logout user => /api/v1/logout
export const logoutUser = catchAsyncErrors(async(req,res,next) => {
    
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        result : "logged out"
    });
     
});

//upload user avatar => /api/v1/me/upload_avatar
export const uploadAvatar = catchAsyncErrors(async(req,res,next) => {
    
    const avatarResponse = await upload_file(req.body.avatar,"ShopIt/avatars");
    
    //remove previous avatar
    if(req?.user?.avatar?.url){
        await delete_file(req?.user?.avatar?.public_id);
    }
    
    const user = await User.findByIdAndUpdate(req?.user?._id, {
        avatar: avatarResponse,
    });
    res.status(200).json({
        user,
    });
     
});



// Forgot password   =>  /api/v1/password/forgot
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    // Find user in the database
    const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      return next(new ErrorHandler("User not found with this email", 404));
    }
  
    // Get reset password token
    const resetToken = user.getResetPasswordToken();
  
    await user.save();
  
    // Create reset password url
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  
    const message = getResetPasswordTemplate(user?.name, resetUrl);
  
    try {
      await sendEmail({
        email: user.email,
        subject: "ShopIT Password Recovery",
        message,
      });
  
      res.status(200).json({
        message: `Email sent to: ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save();
      return next(new ErrorHandler(error?.message, 500));
    }
  });


//Reset Password => /api/v1/password/reset/:token
export const resetPassword = catchAsyncErrors(async (req,res,next) => {
    
    //Hash the URL Token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    console.log(user);
    if(!user)
    {
        return next(
            new ErrorHandler("Password reset token is invalid or has been removed", 400)
        );
    }
    

    if(req.body.password != req.body.confirmPassword){
        return next(
            new ErrorHandler("Password does not match", 400)
        );
    }

    //set the new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendtoken(user, 200 , res);
});

//Get current user profile => /api/v1/me
export const getUserProfile = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req?.user?._id);

    res.status(200).json({
        user,
    });
});

//Update current user password => /api/v1/password/update
export const updatePassword = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req?.user?._id).select('+password');

    //Check the user previous password
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler('Old Password is Incorrect', 400))
    }

    user.password = req.body.password;
    user.save();

    res.status(200).json({
        success : true
    });
});


//Update current user profile => /api/v1/me/update
export const updateProfile = catchAsyncErrors(async(req,res,next) => {

    const newUserData = {
        name :req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user._id, newUserData, { new: true});
    
    res.status(200).json({
        result : "Update successful",
        user,
    });
});


//get all users => /api/v1/admin/users
export const getallUsers = catchAsyncErrors(async(req,res,next) => {
    
    //find all users
    const user = await User.find();

    res.status(200).json({
        user,
    });
});

//get user details => /api/v1/admin/users/:id
export const getUserDetail = catchAsyncErrors(async(req,res,next) => {
    
    //get all users
    const user= await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`user not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        user,
    });
});

//update user details - admin => /api/v1/admin/users/:id
export const updateUserDetail = catchAsyncErrors(async(req,res,next) => {
    
    const newUserData = {
        name :req.body.name,
        email: req.body.email,
        role : req.body.role
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {new : true}); 
    
    res.status(200).json({
        user,
    });
});

//delete user details - admin => /api/v1/admin/users/:id
export const DeleteUser = catchAsyncErrors(async(req,res,next) => {
    
    //find the user from the data by its id
    const user = await User.findById(req.params.id);
    
    //if user not found in the database, it will return an Error
    if(!user) {
        return next(
            new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
        );
    }

    //TODO - Remove user avatar from cloudinary

    //delete the user from database
    await user.deleteOne();

    res.status(200).json({
        success: true,
    });
});