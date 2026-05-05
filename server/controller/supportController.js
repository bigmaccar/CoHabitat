const { SupportTicket, User, Household } = require("../schema");

function getRequestId(req) {
    return req.params.id || req.query._id || req.query.id || req.body?._id;
}

const createSupportTicket = async (req, res) => {
    try {
        const { householdId, reporterId } = req.body;
        const title = String(req.body.title || "").trim();
        const description = String(req.body.description || "").trim();
        if (!householdId || !reporterId || !title || !description) {
            return res.status(400).json({ errorMessage: "Missing required fields: householdId, reporterId, title, description" });
        }
        const newSupportTicket = new SupportTicket({
            ...req.body,
            title,
            description,
            messages: [
                {
                    authorId: reporterId,
                    text: description,
                    createdAt: new Date()
                }
            ],
            auditTrail: [
                {
                    action: "created",
                    byUserId: reporterId,
                    note: "Ticket created.",
                    createdAt: new Date()
                }
            ]
        });
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
        if (req.query.reporterId) {
            filters.reporterId = req.query.reporterId;
        }
        if (req.query.apartmentId) {
            filters.apartmentId = req.query.apartmentId;
        }
        if (req.query.type) {
            filters.type = req.query.type;
        }
        if (req.query.priority) {
            filters.priority = req.query.priority;
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
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Support ticket id is required." });
        }

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
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Support ticket id is required." });
        }

        const { _id, ...updates } = req.body;
        if (updates.title !== undefined) {
            updates.title = String(updates.title || "").trim();
        }
        if (updates.description !== undefined) {
            updates.description = String(updates.description || "").trim();
        }

        const updatedData = await SupportTicket.findByIdAndUpdate(id, updates, { returnDocument: "after" });
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
        const supportTicketId = req.params.id || req.body.supportTicketId;
        const { authorId } = req.body;
        const text = String(req.body.text || "").trim();
        
        if (!supportTicketId || !authorId || !text) {
            return res.status(400).json({ errorMessage: "Missing required fields: supportTicketId, authorId, text" });
        }
        
        const supportTicket = await SupportTicket.findById(supportTicketId);
        if (!supportTicket) {
            return res.status(404).json({ message: "Support ticket not found." });
        }
        
        const updatedSupportTicket = await SupportTicket.findByIdAndUpdate(
            supportTicketId, 
            {
                $push: {
                    messages: { authorId, text, createdAt: new Date() },
                    auditTrail: {
                        action: "message_added",
                        byUserId: authorId,
                        note: "Message added.",
                        createdAt: new Date()
                    }
                }
            },
            { returnDocument: "after" }
        );
        res.status(200).json(updatedSupportTicket);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const banUser = async (req, res) => {
    try {
        const { targetUserId, reason, byUserId } = req.body;
        const durationDays = Number(req.body.durationDays) || 30;

        if (!targetUserId || !reason || !byUserId) {
            return res.status(400).json({ errorMessage: "Missing required fields: targetUserId, reason, byUserId" });
        }

        const banUntil = new Date();
        banUntil.setDate(banUntil.getDate() + durationDays);

        const updatedUser = await User.findByIdAndUpdate(
            targetUserId,
            {
                $set: {
                    bannedUntil: banUntil,
                    isBanned: true
                },
                $push: {
                    moderationNotes: {
                        action: "banned",
                        reason,
                        byUserId,
                        createdAt: new Date()
                    }
                }
            },
            { returnDocument: "after" }
        );

        if (!updatedUser) {
            return res.status(404).json({ errorMessage: "User not found." });
        }

        res.status(200).json({ message: "User banned successfully", user: updatedUser, bannedUntil: banUntil });
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const kickUser = async (req, res) => {
    try {
        const { targetUserId, reason, byUserId, householdId } = req.body;

        if (!targetUserId || !reason || !byUserId) {
            return res.status(400).json({ errorMessage: "Missing required fields: targetUserId, reason, byUserId" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ errorMessage: "User not found." });
        }

        const moderationNote = {
            action: "kicked",
            reason,
            byUserId,
            createdAt: new Date()
        };

        let updatedHousehold = null;
        if (householdId) {
            updatedHousehold = await Household.findByIdAndUpdate(
                householdId,
                {
                    $pull: { members: { userId: targetUserId } },
                    $push: { moderationNotes: moderationNote }
                },
                { returnDocument: "after" }
            );

            if (!updatedHousehold) {
                return res.status(404).json({ errorMessage: "Household not found." });
            }
        } else {
            await Household.updateMany(
                { "members.userId": targetUserId },
                {
                    $pull: { members: { userId: targetUserId } },
                    $push: { moderationNotes: moderationNote }
                }
            );
        }

        const userUpdate = householdId
            ? {
                $set: { isKicked: true },
                $pull: { households: { householdId } },
                $push: { moderationNotes: moderationNote }
            }
            : {
                $set: { isKicked: true, households: [] },
                $push: { moderationNotes: moderationNote }
            };

        const updatedUser = await User.findByIdAndUpdate(targetUserId, userUpdate, { returnDocument: "after" });
        if (!updatedUser) {
            return res.status(404).json({ errorMessage: "User not found." });
        }

        res.status(200).json({ message: "User kicked successfully", user: updatedUser, household: updatedHousehold });
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

module.exports = {
    createSupportTicket,
    getAllSupportTickets,
    getSupportTicketById,
    updateSupportTicket,
    addSupportTicketMessage,
    banUser,
    kickUser
};
