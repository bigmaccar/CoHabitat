const express = require("express");
const {createUser, getAllUsers, getUserById, updateUser, deleteUser} = require( "./controller/userController.js"); 
const {createBill, getBillById, getShareById, updateBill, deleteBill} = require("./controller/billController.js"); 
const {createChore, getAllChoresByHousehold, getChoreById, updateChore, deleteChore} = require("./controller/choreController.js"); 
const {createEvent, getAllEventsByHouseholdId, getEventById, updateEvent, deleteEvent} = require("./controller/eventController.js"); 
const {createHousehold, getAllHouseholds, getHouseholdById, updateHousehold, deleteHousehold} = require("./controller/householdController.js"); 
const {createListing, getAllListings, getListingById, updateListing, deleteListing} = require("./controller/listingController.js"); 
const {createMessage, getAllMessagesById} = require("./controller/messageController.js"); 
const {createSavedListing, getSavedListingById, getAllSavedListings, updateSavedListing, deleteSavedListing} = require("./controller/savedListingController.js");

const router = express.Router();

router.post("/user", createUser);
router.get("/user", getUserById);
router.get("/users", getAllUsers);
router.put("/update/user/:id", updateUser);
router.delete("/delete/user/:id", deleteUser);

router.post("/household", createHousehold);
router.get("/households", getAllHouseholds);
router.get("/household", getHouseholdById);
router.put("/update/household/:id", updateHousehold);
router.delete("/delete/household/:id", deleteHousehold);

router.post("/bill", createBill);
router.get("/bill", getShareById);
router.get("/bill", getBillById);
router.put("/update/bill/:id", updateBill);
router.delete("/delete/bill/:id", deleteBill);

router.post("/chore", createChore);
router.get("/chores", getAllChoresByHousehold);
router.get("/chore", getChoreById);
router.put("/update/chore/:id", updateChore);
router.delete("/delete/chore/:id", deleteChore);

router.post("/event", createEvent);
router.get("/events", getAllEventsByHouseholdId);
router.get("/event", getEventById);
router.put("/update/event/:id", updateEvent);
router.delete("/delete/event/:id", deleteEvent);

router.post("/listing", createListing);
router.get("/listings", getAllListings);
router.get("/listing", getListingById);
router.put("/update/listing/:id", updateListing);
router.delete("/delete/listing/:id", deleteListing);

router.post("/message", createMessage);
router.get("/messages", getAllMessagesById);

router.post("/savedListing", createSavedListing);
router.get("/savedListings", getAllSavedListings);
router.get("/savedListing", getSavedListingById);
router.put("/update/savedListing/:id", updateSavedListing);
router.delete("/delete/savedListing/:id", deleteSavedListing);


module.exports = router;