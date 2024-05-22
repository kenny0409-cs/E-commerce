import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please enter your name'],
        maxlength : [50, 'Your name cannot exceed 50 characters'],
    },
    email: {
        type : String,
        required : [true, 'Please enter your email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [8,"Your password must be longer than 8 character"],
        select: false //dont need to send password into the response
    },

    avatar: { 
        public_id : String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    resetPasswordToken : String,
    resetPasswordExpire: Date,
    }, 
    {timestamps: true}
);

//encrypting the password of user before saving into the database
userSchema.pre('save', async function (next){
    //if the password is not modified, we move to the next model
    if(!this.isModified("password")){
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

//Return JWT token
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id : this._id},process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_TIME,
    });

};

//Compare user password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);

}

//generate password reset token
userSchema.methods.getResetPasswordToken = function() {

    //generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Hash and set to resetPasswordToken field
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    //Set Token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken;
}

export default mongoose.model('User', userSchema);