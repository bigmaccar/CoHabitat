const { Listing } = require("../schema.js");

function getRequestId(req) {
    return req.params.id || req.query._id || req.query.id || req.body?._id;
}

function cleanTags(tags) {
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags.map(tag => String(tag).trim()).filter(Boolean);
}

function normalizeListingPayload(payload) {
    const cleanPayload = { ...payload };
    if (cleanPayload.apartmentName !== undefined) {
        cleanPayload.apartmentName = String(cleanPayload.apartmentName || "").trim();
    }
    if (cleanPayload.description !== undefined) {
        cleanPayload.description = String(cleanPayload.description || "").trim();
    }
    if (cleanPayload.address !== undefined) {
        cleanPayload.address = String(cleanPayload.address || "").trim();
    }
    if (cleanPayload.city !== undefined) {
        cleanPayload.city = String(cleanPayload.city || "").trim();
    }
    if (cleanPayload.state !== undefined) {
        cleanPayload.state = String(cleanPayload.state || "").trim();
    }
    if (cleanPayload.zipCode !== undefined) {
        cleanPayload.zipCode = String(cleanPayload.zipCode || "").trim();
    }
    if (cleanPayload.location !== undefined) {
        cleanPayload.location = String(cleanPayload.location || "").trim();
    }
    if (cleanPayload.houseRules !== undefined) {
        cleanPayload.houseRules = String(cleanPayload.houseRules || "").trim();
    }
    if (cleanPayload.rentAmount !== undefined && cleanPayload.rentAmount !== null && cleanPayload.rentAmount !== "") {
        cleanPayload.rentAmount = Number(cleanPayload.rentAmount);
    }
    if (cleanPayload.lifestyleTags !== undefined) {
        cleanPayload.lifestyleTags = cleanTags(cleanPayload.lifestyleTags);
    }
    if (cleanPayload.idealRoommateTags !== undefined) {
        cleanPayload.idealRoommateTags = cleanTags(cleanPayload.idealRoommateTags);
    }
    if (Array.isArray(cleanPayload.photos)) {
        cleanPayload.photos = cleanPayload.photos
            .map(photo => ({ url: String(photo.url || "").trim() }))
            .filter(photo => photo.url);
    }
    if (!cleanPayload.location && (cleanPayload.city || cleanPayload.state)) {
        cleanPayload.location = [cleanPayload.city, cleanPayload.state].filter(Boolean).join(", ");
    }
    return cleanPayload;
}

const createListing = async(req, res) => {
    try {
        const listingData = normalizeListingPayload(req.body);
        if (!listingData.apartmentName || !listingData.rentAmount || !listingData.location) {
            return res.status(400).json({ message: "Apartment name, rent, and location are required." });
        }
        if (!listingData.listingKey) {
            listingData.listingKey = `listing-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        }
        const newListing = new Listing(listingData);
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
        if (req.query.isActive) {
            filters.isActive = req.query.isActive === "true";
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
        const { _id, ...bodyUpdates } = req.body;
        const updates = normalizeListingPayload(bodyUpdates);
        const query = updates.listingKey ? { listingKey: updates.listingKey } : { _id: id };
        if (!updates.listingKey && !id) {
            return res.status(400).json({ message: "Listing id or listingKey is required." });
        }

        const updatedData = await Listing.findOneAndUpdate(query, updates, {
            returnDocument: "after",
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
