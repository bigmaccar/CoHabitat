const { CalendarEvent } = require("../schema.js");

function getRequestId(req) {
    return req.params.id || req.query._id || req.query.id || req.body?._id;
}

const createEvent = async(req, res) => {
    try {
        const newEvent = new CalendarEvent(req.body);
        const savedData = await newEvent.save();
        res.status(200).json(savedData);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getAllEventsByHouseholdId = async(req, res) => {
    try {
        const householdId = req.query.householdId;
        if (!householdId) {
            return res.status(400).json({ message: "Household id is required." });
        }

        const events = await CalendarEvent.find({ householdId }).sort({ startDateTime: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getEventById = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Calendar event id is required." });
        }

        const eventExist = await CalendarEvent.findById(id);
        if (!eventExist) {
            return res.status(404).json({ message: "Calendar Event not found." });
        }
        res.status(200).json(eventExist);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const updateEvent = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Calendar event id is required." });
        }

        const { _id, ...updates } = req.body;
        const updatedData = await CalendarEvent.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedData) {
            return res.status(404).json({ message: "Calendar Event not found." });
        }
        res.status(200).json(updatedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const deleteEvent = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Calendar event id is required." });
        }

        const deletedData = await CalendarEvent.findByIdAndDelete(id);
        if (!deletedData) {
            return res.status(404).json({ message: "Calendar Event not found." });
        }
        res.status(200).json(deletedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

module.exports = { createEvent, getAllEventsByHouseholdId, getEventById, updateEvent, deleteEvent };
