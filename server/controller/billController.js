const {Bill} = require("../schema.js");

const createBill = async(req, res) => {
    try{
            const newBill = new Bill(req.body);
            const savedData = await newBill.save();
            res.status(200).json({message: "Bill created successfully"});
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getBillById = async(req, res) =>{
    try{
         const id = req.body._id;
         const billExist = await Bill.findById(id);
         if (!billExist){
            return res.status(404).json({message: "Bill not found."});
         }
         res.status(200).json(billExist);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const getShareById = async(req, res) =>{
    try{
         const id = req.body._id;
         const billExist = await Bill.findById(id);
         if (!billExist){
            return res.status(404).json({message: "Share not found."});
         }
         res.status(200).json(billExist);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const updateBill = async(req, res)=>{
    try{
        const id = req.body._id;
         const billExist = await Bill.findById(id);
         if (!billExist){
            return res.status(404).json({message: "Bill not found."});
         }
         const updatedData = await Bill.findByIdAndUpdate(id, req.body, {
            new:true
         });
         res.status(200).json({message: "Bill Updated Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

const deleteBill = async(req, res)=>{
    try{
        const id = req.body._id;
         const billExist = await Bill.findById(id);
         if (!billExist){
            return res.status(404).json({message: "Bill not found."});
         }
         await Bill.findByIdAndDelete(id);
         res.status(200).json({message: "Bill deleted Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

module.exports = {createBill, getBillById, getShareById, updateBill, deleteBill};
