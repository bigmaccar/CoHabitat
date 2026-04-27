const {SavedListing} = require("../schema.js");

const createSavedListing = async(req, res) => {
    try{
            const {userId, listingKey} = req.body;
            const existingSavedListing = await SavedListing.findOne({userId, listingKey});
            if (existingSavedListing) {
                return res.status(200).json(existingSavedListing);
            }

            const newSavedListing = new SavedListing(req.body);
            const savedData = await newSavedListing.save();
            res.status(200).json(savedData);
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getAllSavedListings = async(req, res) =>{
    try{
         const filters = {};
         if (req.query.userId) {
            filters.userId = req.query.userId;
         }
         if (req.query.listingKey) {
            filters.listingKey = req.query.listingKey;
         }

         const savedListingData = await SavedListing.find(filters).sort({ createdAt: -1 });
         res.status(200).json(savedListingData);
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
        const id = req.body._id || req.params.id;
        let deletedData;

        if (req.query.userId && req.query.listingKey) {
            deletedData = await SavedListing.findOneAndDelete({
                userId: req.query.userId,
                listingKey: req.query.listingKey
            });
        } else {
            deletedData = await SavedListing.findByIdAndDelete(id);
        }

         if (!deletedData){
            return res.status(404).json({message: "Saved Listing not found."});
         }
         res.status(200).json(deletedData);
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

module.exports = {createSavedListing, getSavedListingById, getAllSavedListings, updateSavedListing, deleteSavedListing};
