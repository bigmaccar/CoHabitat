const {Chore} = require("../schema.js");

const createChore = async(req, res) => {
    try{
            const newChore = new Chore(req.body);
            const savedData = await newChore.save();
            res.status(200).json({message: "Chore created successfully"});
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getChoreById = async(req, res) =>{
    try{
         const id = req.body._id;
         const choreExist = await Chore.findById(id);
         if (!choreExist){
            return res.status(404).json({message: "Chore not found."});
         }
         res.status(200).json(choreExist);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const getAllChoresByHousehold = async(req, res) =>{
    try{
         const id = req.body._id;
         const choreExist = await Chore.findById(id);
         if (!choreExist){
            return res.status(404).json({message: "Chore not found."});
         }
         res.status(200).json(choreExist);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const updateChore = async(req, res)=>{
    try{
        const id = req.body._id;
         const choreExist = await Chore.findById(id);
         if (!choreExist){
            return res.status(404).json({message: "Chore not found."});
         }
         const updatedData = await Chore.findByIdAndUpdate(id, req.body, {
            new:true
         });
         res.status(200).json({message: "Chore Updated Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

const deleteChore = async(req, res)=>{
    try{
        const id = req.body._id;
         const choreExist = await Chore.findById(id);
         if (!choreExist){
            return res.status(404).json({message: "Chore not found."});
         }
         await Chore.findByIdAndDelete(id);
         res.status(200).json({message: "Chore deleted Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

module.exports = {createChore, getAllChoresByHousehold, getChoreById, updateChore, deleteChore};