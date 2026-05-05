const { Household, User } = require("../schema.js");

function getRequestId(req) {
    return req.params.id || req.query._id || req.query.id || req.body?._id;
}

const createHousehold = async(req, res) => {
    try {
        const { createdBy, ...householdData } = req.body;
        const newHousehold = new Household({
            ...householdData,
            members: createdBy ? [{ userId: createdBy, isAdmin: true }] : []
        });
        const savedData = await newHousehold.save();
        if (createdBy) {
            await User.findByIdAndUpdate(createdBy, {
                $push: { households: { householdId: savedData._id, isAdmin: true } }
            });
        }
        res.status(200).json(savedData);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getAllHouseholds = async(req, res) => {
    try {
        const householdData = await Household.find();
        res.status(200).json(householdData);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getHouseholdById = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Household id is required." });
        }

        const householdExist = await Household.findById(id);
        if (!householdExist) {
            return res.status(404).json({ message: "Household not found." });
        }
        res.status(200).json(householdExist);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const updateHousehold = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Household id is required." });
        }

        const { _id, ...updates } = req.body;
        const updatedData = await Household.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedData) {
            return res.status(404).json({ message: "Household not found." });
        }
        res.status(200).json(updatedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const deleteHousehold = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Household id is required." });
        }

        const deletedData = await Household.findByIdAndDelete(id);
        if (!deletedData) {
            return res.status(404).json({ message: "Household not found." });
        }
        res.status(200).json(deletedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

module.exports = { createHousehold, getAllHouseholds, getHouseholdById, updateHousehold, deleteHousehold };
