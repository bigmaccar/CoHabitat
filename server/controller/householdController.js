const { Household, User } = require("../schema.js");

function getRequestId(req) {
    return req.params.id || req.query._id || req.query.id || req.body?._id;
}

function cleanHouseholdPayload(payload) {
    const cleanPayload = { ...payload };
    if (cleanPayload.name !== undefined) {
        cleanPayload.name = String(cleanPayload.name || "").trim();
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
    if (cleanPayload.maxOccupants !== undefined && cleanPayload.maxOccupants !== "") {
        cleanPayload.maxOccupants = Number(cleanPayload.maxOccupants);
    }
    return cleanPayload;
}

async function addHouseholdToUser(userId, householdId, isAdmin) {
    await User.findByIdAndUpdate(userId, {
        $pull: { households: { householdId } }
    });
    await User.findByIdAndUpdate(userId, {
        $push: { households: { householdId, isAdmin } }
    });
}

const createHousehold = async(req, res) => {
    try {
        const { createdBy, ...householdData } = req.body;
        const cleanData = cleanHouseholdPayload(householdData);

        if (!cleanData.name) {
            return res.status(400).json({ message: "Household name is required." });
        }

        const newHousehold = new Household({
            ...cleanData,
            members: createdBy ? [{ userId: createdBy, isAdmin: true }] : []
        });
        const savedData = await newHousehold.save();
        if (createdBy) {
            await addHouseholdToUser(createdBy, savedData._id, true);
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

        const { _id, createdBy, ...updates } = req.body;
        const cleanUpdates = cleanHouseholdPayload(updates);
        const updatedData = await Household.findByIdAndUpdate(id, cleanUpdates, { returnDocument: "after" });
        if (!updatedData) {
            return res.status(404).json({ message: "Household not found." });
        }
        res.status(200).json(updatedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const addHouseholdMember = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "Household id is required." });
        }

        const household = await Household.findById(id);
        if (!household) {
            return res.status(404).json({ message: "Household not found." });
        }

        const email = String(req.body.email || "").trim().toLowerCase();
        const user = req.body.userId
            ? await User.findById(req.body.userId)
            : await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const existingMember = household.members.find(member => String(member.userId) === String(user._id));
        if (existingMember) {
            await addHouseholdToUser(user._id, household._id, Boolean(existingMember.isAdmin));
            return res.status(200).json(household);
        }

        if (household.maxOccupants && household.members.length >= household.maxOccupants) {
            return res.status(400).json({ message: "Household is already full." });
        }

        household.members.push({
            userId: user._id,
            isAdmin: Boolean(req.body.isAdmin)
        });
        const savedData = await household.save();
        await addHouseholdToUser(user._id, savedData._id, Boolean(req.body.isAdmin));

        res.status(200).json(savedData);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

const removeHouseholdMember = async(req, res) => {
    try {
        const id = req.params.id || req.query.householdId || req.body.householdId;
        const userId = req.params.userId || req.query.userId || req.body.userId;

        if (!id || !userId) {
            return res.status(400).json({ message: "Household id and user id are required." });
        }

        const household = await Household.findById(id);
        if (!household) {
            return res.status(404).json({ message: "Household not found." });
        }

        household.members = household.members.filter(member => String(member.userId) !== String(userId));
        const savedData = await household.save();
        await User.findByIdAndUpdate(userId, {
            $pull: { households: { householdId: savedData._id } }
        });

        res.status(200).json(savedData);
    } catch (error) {
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
        await User.updateMany({}, {
            $pull: { households: { householdId: deletedData._id } }
        });
        res.status(200).json(deletedData);
    } catch(error) {
        res.status(500).json({ errorMessage: error.message });
    }
};

module.exports = {
    createHousehold,
    getAllHouseholds,
    getHouseholdById,
    updateHousehold,
    addHouseholdMember,
    removeHouseholdMember,
    deleteHousehold
};
