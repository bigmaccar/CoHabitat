const {Message} = require("../schema.js");

const createMessage = async(req, res) => {
    try{
            const newMessage = new Message(req.body);
            const savedData = await newMessage.save();
            res.status(200).json(savedData);
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getAllMessagesById = async(req, res) =>{
    try{
         const id = req.query._id || req.body._id;
         if (id) {
            const messageExist = await Message.findById(id);
            if (!messageExist){
                return res.status(404).json({message: "Message not found."});
            }
            return res.status(200).json(messageExist);
         }

         const filters = {};
         if (req.query.senderId) {
            filters.senderId = req.query.senderId;
         }
         if (req.query.receiverId) {
            filters.receiverId = req.query.receiverId;
         }
         if (req.query.listingName) {
            filters.listingName = req.query.listingName;
         }

         const messages = await Message.find(filters).sort({ createdAt: -1 });
         res.status(200).json(messages);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

module.exports = {createMessage, getAllMessagesById};
