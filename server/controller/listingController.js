const {Listing} = require("../schema.js");

const createListing = async(req, res) => {
    try{
            const newListing = new Listing(req.body);
            const savedData = await newListing.save();
            res.status(200).json(savedData);
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getAllListings = async(req, res) =>{
    try{
         const filters = {};
         if (req.query.listingKey) {
            filters.listingKey = req.query.listingKey;
         }
         const listingData = await Listing.find(filters).sort({ createdAt: -1 });
         res.status(200).json(listingData);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const getListingById = async(req, res) =>{
    try{
         const id = req.body._id;
         const listingExist = await Listing.findById(id);
         if (!listingExist){
            return res.status(404).json({message: "Listing not found."});
         }
         res.status(200).json(listingExist);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const updateListing = async(req, res)=>{
    try{
        const id = req.body._id || req.params.id;
        const updateOptions = {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        };
        const query = req.body.listingKey ? { listingKey: req.body.listingKey } : { _id: id };
        const updatedData = await Listing.findOneAndUpdate(query, req.body, updateOptions);
        res.status(200).json(updatedData);
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

const deleteListing = async(req, res)=>{
    try{
        const id = req.body._id;
         const listingExist = await Listing.findById(id);
         if (!listingExist){
            return res.status(404).json({message: "Listing not found."});
         }
         await Listing.findByIdAndDelete(id);
         res.status(200).json({message: "Listing deleted Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

module.exports = {createListing, getAllListings, getListingById, updateListing, deleteListing};
