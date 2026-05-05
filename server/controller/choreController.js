const { Chore } = require("../schema.js");

function getRequestId(req) {
    return req.params.id || req.query._id || req.query.id || req.body?._id;
}

function cleanChorePayload(payload) {
    const cleanPayload = { ...payload };
    if (cleanPayload.title !== undefined) {
        cleanPayload.title = String(cleanPayload.title || "").trim();
    }
    if (cleanPayload.notes !== undefined) {
        cleanPayload.notes = String(cleanPayload.notes || "").trim();
    }
    if (!cleanPayload.category) {
        cleanPayload.category = "chore";
    }
    if (cleanPayload.assignedTo === "") {
        cleanPayload.assignedTo = undefined;
    }
    if (cleanPayload.dueDate === "") {
        cleanPayload.dueDate = undefined;
    }
    return cleanPayload;
}

const createChore = async(req, res) => {
    try {
        const choreData = cleanChorePayload(req.body);
        if (!choreData.householdId || !choreData.title) {
            return res.status(400).json({ message: "Household id and title are required." });
        }

        const newChore = new Chore(choreData);
        const savedData = await newChore.save();
        res.status(200).json(savedData);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getChoreById = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Chore id is required." });
        }

        const choreExist = await Chore.findById(id);
        if (!choreExist) {
            return res.status(404).json({ message: "Chore not found." });
        }
        res.status(200).json(choreExist);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getAllChoresByHousehold = async(req, res) => {
    try {
        const filters = {};
        if (req.query.householdId) {
            filters.householdId = req.query.householdId;
        }
        if (req.query.assignedTo) {
            filters.assignedTo = req.query.assignedTo;
        }
        if (req.query.status) {
            filters.status = req.query.status;
        }
        if (req.query.category) {
            filters.category = req.query.category;
        }

        const chores = await Chore.find(filters).sort({ createdAt: -1 });
        res.status(200).json(chores);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const updateChore = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Chore id is required." });
        }

        const { _id, ...updates } = req.body;
        const updatedData = await Chore.findByIdAndUpdate(id, cleanChorePayload(updates), { returnDocument: "after" });
        if (!updatedData) {
            return res.status(404).json({ message: "Chore not found." });
        }
        res.status(200).json(updatedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const deleteChore = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Chore id is required." });
        }

        const deletedData = await Chore.findByIdAndDelete(id);
        if (!deletedData) {
            return res.status(404).json({ message: "Chore not found." });
        }
        res.status(200).json(deletedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

module.exports = { createChore, getAllChoresByHousehold, getChoreById, updateChore, deleteChore };
