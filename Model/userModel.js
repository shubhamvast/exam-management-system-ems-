const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: [
        3,
        "firstName length is must be greater than or equal to 3 character",
      ],
      maxLength: [
        50,
        "firstName length is must be less than or equal to 50 character",
      ],
      required: true,
    },
    lastName: {
      type: String,
      minLength: [
        3,
        "lastName length is must be greater than or equal to 3 character",
      ],
      maxLength: [
        50,
        "lastName length is must be less than or equal to 50 character",
      ],
      required: true,
    },
    email: {
      type: String,
      minLength: [
        5,
        "email length is must be greater than or equal to 5 character",
      ],
      maxLength: [
        255,
        "email length is must be less than or equal to 255 character",
      ],
      required: true,
    },
    phone: {
      type: String,
      minLength: [10, "user phone length must be 10"],
      maxLength: [10, "user phone length must be 10"],

      required: true,
    },
    userName: {
      type: String,
      minLength: [
        5,
        "userName length is must be greater than or equal to 5 character",
      ],
      maxLength: [
        255,
        "userName length is must be less than or equal to 255 character",
      ],
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: [
        8,
        "password length is must be greater than or equal to 8 character",
      ],
      maxLength: [
        1024,
        "password length is must be less than or equal to 255 character",
      ],
      required: true,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "examiner", "student", "paperSetter"],
        message: "{value} value is not supported",
      },
      required: true,
    },
    lastLoggedIn: {
      type: Date,
      default: Date.now(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    resetPasswordLink:{
      type:String,
      default:""
    }
  },
  { timestamps: true }
);


const jwt = require('jsonwebtoken');
const { string } = require("joi");
require("dotenv").config();

userSchema.methods.getAuthToken = function(){
  return jwt.sign({_id:this._id,role:this.role,isActive:this.isActive,name:this.firstName+ " "+this.lastName},process.env.jwtPrivateKey);

}


const User = mongoose.model("user", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    firstname: Joi.string().min(3).max(50).required(),
    lastname: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    phone: Joi.string().min(10).max(10).required("phone must be required"),
    username: Joi.string().min(8).max(255).required(),
    password: Joi.string().min(8).max(1024).required(),
    role: Joi.string().required(),
  });

  return schema.validate(user);
}

module.exports = { User, userSchema, validateUser };
