const {User} = require("../schema.js");

const createUser = async(req, res) => {
    try{
            const newUser = new User(req.body);
            const {email} = newUser;
            const userExist = await User.findOne({email: email});
            if (userExist){
                return res.status(400).json({message : "User already exists."});
            }
            const savedData = await newUser.save();
            res.status(200).json({message: "User created successfully"});
    } catch (error){
        res.status(500).json({message:error.message})
    }
};

const getAllUsers = async(req, res) =>{
    try{
        const userData = await User.find();
        if(!userData || userData.length === 0){
            return resizeTo.status(404).json({message:"User data not found."});
        }
        res.status(200).json(userData);
    } catch (error){
        res.status(500).json({message:error.message})
    }
}

const getUserById = async(req, res) =>{
    try{
         const id = req.body._id;
         const userExist = await User.findById(id);
         if (!userExist){
            return res.status(404).json({message: "User not found."});
         }
         res.status(200).json(userExist);
    }catch (error){
        res.status(500).json({message: error.message});
    }
}

const updateUser = async(req, res)=>{
    try{
        const id = req.body._id;
         const userExist = await User.findById(id);
         if (!userExist){
            return res.status(404).json({message: "User not found."});
         }
         const updatedData = await User.findByIdAndUpdate(id, req.body, {
            new:true
         });
         res.status(200).json({message: "User Updated Successfully"});
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

const deleteUser = async(req, res)=>{
    try{
        const id = req.body._id;
         const userExist = await User.findById(id);
         if (!userExist){
            return res.status(404).json({message: "User not found."});
         }
         await User.findByIdAndDelete(id);
         res.status(200).json({message: "User deleted Successfully"});
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
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

module.exports = {createUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser};