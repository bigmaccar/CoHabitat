const { Bill } = require("../schema.js");

function getRequestId(req) {
    return req.params.id || req.query._id || req.query.id || req.body?._id;
}

const createBill = async(req, res) => {
    try {
        const newBill = new Bill(req.body);
        const savedData = await newBill.save();
        res.status(200).json(savedData);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getBillById = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Bill id is required." });
        }

        const billExist = await Bill.findById(id);
        if (!billExist) {
            return res.status(404).json({ message: "Bill not found." });
        }
        res.status(200).json(billExist);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getBillsByHousehold = async(req, res) => {
    try {
        const householdId = req.query.householdId;
        if (!householdId) {
            return res.status(400).json({ message: "Household id is required." });
        }

        const bills = await Bill.find({ householdId }).sort({ createdAt: -1 });
        res.status(200).json(bills);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const updateBill = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Bill id is required." });
        }

        const { _id, ...updates } = req.body;
        const updatedData = await Bill.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedData) {
            return res.status(404).json({ message: "Bill not found." });
        }
        res.status(200).json(updatedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const deleteBill = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Bill id is required." });
        }

        const deletedData = await Bill.findByIdAndDelete(id);
        if (!deletedData) {
            return res.status(404).json({ message: "Bill not found." });
        }
        res.status(200).json(deletedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

module.exports = { createBill, getBillsByHousehold, getBillById, updateBill, deleteBill };
