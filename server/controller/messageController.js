const {Message, User} = require("../schema.js");

const SUPPORT_EMAIL = "support@gmail.com";

async function isSupportChatClosed(participantId, supportChatId) {
    const endedFilters = {
        isSupportMessage: true,
        $and: [
            { $or: [{ senderId: participantId }, { receiverId: participantId }] },
            { $or: [{ isSupportChatEnded: true }, { senderName: "Support Team", messageText: "Support chat ended." }] }
        ]
    };

    if (supportChatId) {
        endedFilters.supportChatId = supportChatId;
    }

    const endedSupportChat = await Message.findOne(endedFilters).sort({ createdAt: -1 });

    if (!endedSupportChat) {
        return false;
    }

    const newSupportChatFilters = {
        isSupportMessage: true,
        startsSupportChat: true,
        createdAt: { $gt: endedSupportChat.createdAt },
        $or: [{ senderId: participantId }, { receiverId: participantId }]
    };

    if (supportChatId) {
        newSupportChatFilters.supportChatId = supportChatId;
    }

    const newSupportChat = await Message.findOne(newSupportChatFilters);

    return !newSupportChat;
}

const createMessage = async(req, res) => {
    try{
            if (req.body.isSupportMessage && req.body.senderName === "Support Team") {
                const supportUser = await User.findById(req.body.senderId);
                if (!supportUser || supportUser.email.toLowerCase() !== SUPPORT_EMAIL) {
                    return res.status(403).json({errorMessage: "Only the support user can send support replies."});
                }
            }

            if (req.body.isSupportMessage && !req.body.isSupportChatEnded) {
                const participantId = req.body.senderName === "Support Team" ? req.body.receiverId : req.body.senderId;
                const supportChatClosed = await isSupportChatClosed(participantId, req.body.supportChatId);

                if (supportChatClosed && !req.body.startsSupportChat) {
                    return res.status(400).json({errorMessage: "This support chat has been ended."});
                }
            }

            const newMessage = new Message(req.body);
            const savedData = await newMessage.save();
            res.status(200).json(savedData);
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getAllMessagesById = async(req, res) =>{
    try{
         const id = req.query._id || req.body?._id;
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
         if (req.query.isSupportMessage) {
            filters.isSupportMessage = req.query.isSupportMessage === "true";
         }

         const messages = await Message.find(filters).sort({ createdAt: -1 });
         res.status(200).json(messages);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

module.exports = {createMessage, getAllMessagesById};
