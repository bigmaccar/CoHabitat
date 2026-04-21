const {Message} = require("../schema.js");

const createMessage = async(req, res) => {
    try{
            const newMessage = new Message(req.body);
            const savedData = await newMessage.save();
            res.status(200).json({message: "Message created successfully"});
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getAllMessagesById = async(req, res) =>{
    try{
         const id = req.body._id;
         const messageExist = await Message.findById(id);
         if (!messageExist){
            return res.status(404).json({message: "Message not found."});
         }
         res.status(200).json(messageExist);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

module.exports = {createMessage, getAllMessagesById};