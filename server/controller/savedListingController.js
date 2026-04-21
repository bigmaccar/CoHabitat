const {SavedListing} = require("../schema.js");

const createSavedListing = async(req, res) => {
    try{
            const newSavedListing = new SavedListing(req.body);
            const savedData = await newSavedListing.save();
            res.status(200).json({message: "Saved Listing created successfully"});
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getAllSavedListings = async(req, res) =>{
    try{
         const id = req.body._id;
         const savedListingExist = await SavedListing.findById(id);
         if (!savedListingExist){
            return res.status(404).json({message: "Saved Listing not found."});
         }
         res.status(200).json(savedListingExist);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const getSavedListingById = async(req, res) =>{
    try{
         const id = req.body._id;
         const savedListingExist = await SavedListing.findById(id);
         if (!savedListingExist){
            return res.status(404).json({message: "Saved Listing not found."});
         }
         res.status(200).json(savedListingExist);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const updateSavedListing = async(req, res)=>{
    try{
        const id = req.body._id;
         const savedListingExist = await SavedListing.findById(id);
         if (!savedListingExist){
            return res.status(404).json({message: "Saved Listing not found."});
         }
         const updatedData = await SavedListing.findByIdAndUpdate(id, req.body, {
            new:true
         });
         res.status(200).json({message: "Saved Listing Updated Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

const deleteSavedListing = async(req, res)=>{
    try{
        const id = req.body._id;
         const savedListingExist = await SavedListing.findById(id);
         if (!savedListingExist){
            return res.status(404).json({message: "Saved Listing not found."});
         }
         await SavedListing.findByIdAndDelete(id);
         res.status(200).json({message: "Saved Listing deleted Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

module.exports = {createSavedListing, getSavedListingById, getAllSavedListings, updateSavedListing, deleteSavedListing};