const { Listing } = require("../schema.js");

function getRequestId(req) {
    return req.params.id || req.query._id || req.query.id || req.body?._id;
}

const createListing = async(req, res) => {
    try {
        const newListing = new Listing(req.body);
        const savedData = await newListing.save();
        res.status(200).json(savedData);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getAllListings = async(req, res) => {
    try {
        const filters = {};
        if (req.query.listingKey) {
            filters.listingKey = req.query.listingKey;
        }
        if (req.query.householdId) {
            filters.householdId = req.query.householdId;
        }
        if (req.query.createdBy) {
            filters.createdBy = req.query.createdBy;
        }

        const listingData = await Listing.find(filters).sort({ createdAt: -1 });
        res.status(200).json(listingData);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const getListingById = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Listing id is required." });
        }

        const listingExist = await Listing.findById(id);
        if (!listingExist) {
            return res.status(404).json({ message: "Listing not found." });
        }
        res.status(200).json(listingExist);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const updateListing = async(req, res) => {
    try {
        const id = getRequestId(req);
        const { _id, ...updates } = req.body;
        const query = updates.listingKey ? { listingKey: updates.listingKey } : { _id: id };
        if (!updates.listingKey && !id) {
            return res.status(400).json({ message: "Listing id or listingKey is required." });
        }

        const updatedData = await Listing.findOneAndUpdate(query, updates, {
            new: true,
            upsert: Boolean(updates.listingKey),
            setDefaultsOnInsert: true
        });
        res.status(200).json(updatedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const deleteListing = async(req, res) => {
    try {
        const id = getRequestId(req);
        let deletedData;

        if (req.query.listingKey) {
            deletedData = await Listing.findOneAndDelete({ listingKey: req.query.listingKey });
        } else if (id) {
            deletedData = await Listing.findByIdAndDelete(id);
        } else {
            return res.status(400).json({ message: "Listing id or listingKey is required." });
        }

        if (!deletedData) {
            return res.status(404).json({ message: "Listing not found." });
        }
        res.status(200).json(deletedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

module.exports = { createListing, getAllListings, getListingById, updateListing, deleteListing };
