const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  password: String,
  roles: [String],
  lifestyleTags: [String],
  households: [
    {
      householdId: { type: Schema.Types.ObjectId, ref: "Household" },
      isAdmin: Boolean
    }
  ]
}, { timestamps: true });

const HouseholdSchema = new Schema({
  name: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  maxOccupants: Number,

  members: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      isAdmin: Boolean
    }
  ]
}, { timestamps: true, collection: "Household"});

const ListingSchema = new Schema({
  householdId: { type: Schema.Types.ObjectId, ref: "Household" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },

  description: String,
  rentAmount: Number,
  isActive: Boolean,

  photos: [
    {
      url: String
    }
  ],

  lifestyleTags: [String]
}, { timestamps: true, collection: "Listing" });

const SavedListingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  listingId: { type: Schema.Types.ObjectId, ref: "Listing" }
}, { timestamps: true, collection: "SavedListing" });

const MessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: Schema.Types.ObjectId, ref: "User" },
  messageText: String
}, { timestamps: true, collection: "Message" });

const BillSchema = new Schema({
  householdId: { type: Schema.Types.ObjectId, ref: "Household" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },

  billName: String,
  totalAmount: Number,

  shares: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      amountOwed: Number,
      isPaid: Boolean
    }
  ],
  // New fields  
  dueDate: Date,
  comments: [{
    author: String,
    text: String,
    date: String
  }]

}, { timestamps: true, collection: "Bill" });

const CalendarEventSchema = new Schema({
  householdId: { type: Schema.Types.ObjectId, ref: "Household" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },

  title: String,
  startDateTime: Date,
  endDateTime: Date
}, { timestamps: true, collection: "CalendarEvent" });

const ChoreSchema = new Schema({
  householdId: { type: Schema.Types.ObjectId, ref: "Household" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },

  title: String,
  dueDate: Date,
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending"
  }
}, { timestamps: true, collection: "Chore" });

module.exports = {
  User: mongoose.model("User", UserSchema),
  Household: mongoose.model("Household", HouseholdSchema),
  Listing: mongoose.model("Listing", ListingSchema),
  SavedListing: mongoose.model("SavedListing", SavedListingSchema),
  Message: mongoose.model("Message", MessageSchema),
  Bill: mongoose.model("Bill", BillSchema),
  CalendarEvent: mongoose.model("CalendarEvent", CalendarEventSchema),
  Chore: mongoose.model("Chore", ChoreSchema)
};