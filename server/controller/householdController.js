const {Household, User} = require("../schema.js");

const createHousehold = async(req, res) => {
    try{
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
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getAllHouseholds = async(req, res) =>{
    try{
        const householdData = await Household.find();
        if(!householdData || householdData.length === 0){
            return resizeTo.status(404).json({message:"Household data not found."});
        }
        res.status(200).json(householdData);
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
}

const getHouseholdById = async(req, res) =>{
    try{
         const id = req.body._id;
         const householdExist = await Household.findById(id);
         if (!householdExist){
            return res.status(404).json({message: "Household not found."});
         }
         res.status(200).json(householdExist);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const updateHousehold = async(req, res)=>{
    try{
        const id = req.body._id;
         const householdExist = await Household.findById(id);
         if (!householdExist){
            return res.status(404).json({message: "Household not found."});
         }
         const updatedData = await Household.findByIdAndUpdate(id, req.body, {
            new:true
         });
         res.status(200).json({message: "Household Updated Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

const deleteHousehold = async(req, res)=>{
    try{
        const id = req.body._id;
         const householdExist = await Household.findById(id);
         if (!householdExist){
            return res.status(404).json({message: "Household not found."});
         }
         await Household.findByIdAndDelete(id);
         res.status(200).json({message: "Household deleted Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

module.exports = {createHousehold, getAllHouseholds, getHouseholdById, updateHousehold, deleteHousehold};