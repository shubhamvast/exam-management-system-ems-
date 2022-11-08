const mongoose = require("mongoose");


const topicSchema = new mongoose.Schema({
    name:{
        type: String,
        minLength:[3,"minimum length of topic is 3"],
        maxLength:[255,"maximum length of topic is 255"],
        required:true
    },
  
    subject:new mongoose.Schema({
        _id:{
            type: mongoose.Schema.Types.ObjectId,
            required:true
        },
        name: {
            type: String,
            required: true,
            minLength: [1, "subject's minimum length 1 characters"],
            maxLength: [50, "subject's minimum length 50 characters "],
          },
    })


})

const Topic = mongoose.model("topic",topicSchema);
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi)

function validateTopic(topic){
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        subject: Joi.objectId()
    });

    return schema.validate(topic);
}


module.exports = {Topic,topicSchema,validateTopic};