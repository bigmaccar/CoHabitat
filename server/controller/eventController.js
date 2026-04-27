const {CalendarEvent} = require("../schema.js");

const createEvent = async(req, res) => {
    try{
            const newEvent = new CalendarEvent(req.body);
            const savedData = await newEvent.save();
            res.status(200).json({message: "Calendar Event created successfully"});
    } catch (error){
        res.status(500).json({errorMessage:error.message})
    }
};

const getAllEventsByHouseholdId = async(req, res) =>{
    try{
         const householdId = req.query.householdId;
         const events = await CalendarEvent.find({ householdId });
         res.status(200).json(events);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const getEventById = async(req, res) =>{
    try{
         const id = req.body._id;
         const eventExist = await CalendarEvent.findById(id);
         if (!eventExist){
            return res.status(404).json({message: "Calendar Event not found."});
         }
         res.status(200).json(eventExist);
    }catch (error){
        res.status(500).json({errorMessage: error.message});
    }
}

const updateEvent = async(req, res)=>{
    try{
        const id = req.body._id;
         const eventExist = await CalendarEvent.findById(id);
         if (!eventExist){
            return res.status(404).json({message: "Calendar Event not found."});
         }
         const updatedData = await CalendarEvent.findByIdAndUpdate(id, req.body, {
            new:true
         });
         res.status(200).json({message: "Calendar Event Updated Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

const deleteEvent = async(req, res)=>{
    try{
        const id = req.params.id;
         const eventExist = await CalendarEvent.findById(id);
         if (!eventExist){
            return res.status(404).json({message: "Calendar Event not found."});
         }
         await CalendarEvent.findByIdAndDelete(id);
         res.status(200).json({message: "Calendar Event deleted Successfully"});
    }catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}

module.exports = {createEvent, getAllEventsByHouseholdId, getEventById, updateEvent, deleteEvent};