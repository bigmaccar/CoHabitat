const { User } = require("../schema.js");

function getRequestId(req) {
    return req.params.id || req.query._id || req.query.id || req.body?._id;
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

const createUser = async(req, res) => {
    try {
        const firstName = String(req.body.firstName || "").trim();
        const lastName = String(req.body.lastName || "").trim();
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || "");

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "First name, last name, email, and password are required." });
        }
        if (!email.includes("@")) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists." });
        }

        const newUser = new User({
            ...req.body,
            firstName,
            lastName,
            email,
            password
        });
        const savedData = await newUser.save();
        res.status(200).json({ message: "User created successfully", user: savedData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async(req, res) => {
    try {
        const userData = await User.find();
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "User id is required." });
        }

        const userExist = await User.findById(id);
        if (!userExist) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(userExist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "User id is required." });
        }

        const { _id, ...updates } = req.body;
        if (updates.firstName !== undefined) {
            updates.firstName = String(updates.firstName || "").trim();
        }
        if (updates.lastName !== undefined) {
            updates.lastName = String(updates.lastName || "").trim();
        }
        if (updates.email !== undefined) {
            updates.email = normalizeEmail(updates.email);
            if (!updates.email || !updates.email.includes("@")) {
                return res.status(400).json({ message: "Please enter a valid email address." });
            }
            const existingUser = await User.findOne({ email: updates.email, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists." });
            }
        }
        if (Array.isArray(updates.lifestyleTags)) {
            updates.lifestyleTags = updates.lifestyleTags.map(tag => String(tag).trim()).filter(Boolean);
        }

        const updatedData = await User.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedData) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(updatedData);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async(req, res) => {
    try {
        const id = getRequestId(req);
        if (!id) {
            return res.status(400).json({ message: "User id is required." });
        }

        const deletedData = await User.findByIdAndDelete(id);
        if (!deletedData) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(deletedData);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || "");
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: "Incorrect password." });
        }
        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser };
