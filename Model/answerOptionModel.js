const mongoose = require("mongoose");

const answerOptionSchema = new mongoose.Schema({

    option: {
        type: String,
        required: true,
        minLength: [1,"option length is greter than  0 characters"],
        maxLength:[1,"option length is less than 1 characters"],
        required:true
    },
    optionText:{
        type: String,
        minLength:[1,"option text lenght greter than 1 characters"],
        maxLength:[1024,"option text length less than 1024 characters"],
        required:true,
    },
    question:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
    },
    isCorrect:{
        type: Boolean,
        default:false,
    }

});

const AnswerOption = mongoose.model("answerOption",answerOptionSchema);


const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi)

function validateAnswerOption(answerOption){
    const schema = Joi.object({
        option: Joi.string().min(1).max(1).required(),
        optionText : Joi.string().min(1).max(1024).required(),
        question: Joi.objectId(),
        isCorrect:Joi.boolean()
    });
    
    return schema.validate(answerOption);

}



module.exports = {AnswerOption,answerOptionSchema,validateAnswerOption};
