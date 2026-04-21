const {Listing} = require("../schema.js");

const createListing = async(req, res) => {
    try{
            const newListing = new Listing(req.body);
            const savedData = await newListing.save();
            res.status(200).json({message: "Listing created successfully"});
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getAllListings = async(req, res) =>{
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
        const id = req.body._id;
         const listingExist = await Listing.findById(id);
         if (!listingExist){
            return res.status(404).json({message: "Listing not found."});
         }
         const updatedData = await Listing.findByIdAndUpdate(id, req.body, {
            new:true
         });
         res.status(200).json({message: "Listing Updated Successfully"});
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