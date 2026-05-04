const {SupportTicket} = require("../schema");

const createSupportTicket = async (req, res) => {
    try {
        const { householdId, reporterId, title, description } = req.body;
        if (!householdId || !reporterId || !title || !description) {
            return res.status(400).json({ errorMessage: "Missing required fields: householdId, reporterId, title, description" });
        }
        const newSupportTicket = new SupportTicket(req.body);
        const savedData = await newSupportTicket.save();
        res.status(200).json(savedData);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getAllSupportTickets = async (req, res) => {
    try {
        const filters = {};
        if (req.query.householdId) {
            filters.householdId = req.query.householdId;
        }
        if (req.query.apartmentId) {
            filters.apartmentId = req.query.apartmentId;
        }
        if (req.query.type) {
            filters.type = req.query.type;
        }
        if (req.query.status) {
            filters.status = req.query.status;
        }
        
        const sortBy = req.query.sort || "createdAt";
        const supportTickets = await SupportTicket.find(filters).sort({ [sortBy]: -1 });
        res.status(200).json(supportTickets);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getSupportTicketById = async(req, res) => {
    try {
        const id = req.body._id || req.query._id;
        const supportTicketExist = await SupportTicket.findById(id);
        if (!supportTicketExist) {
            return res.status(404).json({ message: "Support ticket not found." });
        }
        res.status(200).json(supportTicketExist);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }   
};

const updateSupportTicket = async(req, res) => {
    try {
        const id = req.body._id || req.params.id;
        const updateOptions = {
            new: true,
            upsert: false
        };
        const updatedData = await SupportTicket.findByIdAndUpdate(id, req.body, updateOptions);
        if (!updatedData) {
            return res.status(404).json({ message: "Support ticket not found." });
        }
        res.status(200).json(updatedData);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const addSupportTicketMessage = async(req, res) => {
    try {
        const supportTicketId = req.body.supportTicketId;
        const { authorId, text } = req.body;
        
        if (!supportTicketId || !authorId || !text) {
            return res.status(400).json({ errorMessage: "Missing required fields: supportTicketId, authorId, text" });
        }
        
        const supportTicket = await SupportTicket.findById(supportTicketId);
        if (!supportTicket) {
            return res.status(404).json({ message: "Support ticket not found." });
        }
        
        const updatedSupportTicket = await SupportTicket.findByIdAndUpdate(
            supportTicketId, 
            { $push: { messages: { authorId, text, createdAt: new Date() } } }, 
            { new: true }
        );
        res.status(200).json(updatedSupportTicket);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

module.exports = {
    createSupportTicket,
    getAllSupportTickets,
    getSupportTicketById,
    updateSupportTicket,
    addSupportTicketMessage
};