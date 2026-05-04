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

  listingKey: String,
  apartmentName: String,
  description: String,
  rentAmount: Number,
  isActive: { type: Boolean, default: true },

  photos: [
    {
      url: String
    }
  ],

  lifestyleTags: [String]
}, { timestamps: true, collection: "Listing" });

const SavedListingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  listingId: { type: Schema.Types.ObjectId, ref: "Listing" },
  listingKey: String,
  listingName: String,
  listingLocation: String,
  listingRent: String
}, { timestamps: true, collection: "SavedListing" });

const MessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "User" },
  senderName: String,
  receiverId: { type: Schema.Types.ObjectId, ref: "User" },
  receiverName: String,
  listingName: String,
  messageText: String,
  isSupportMessage: { type: Boolean, default: false },
  supportChatId: String,
  startsSupportChat: { type: Boolean, default: false },
  isSupportChatEnded: { type: Boolean, default: false }
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
  description: String,
  type: String,
  startDateTime: Date,
  endDateTime: Date,
  peopleOver: Boolean
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

const SupportTicketSchema = new Schema({
  householdId: { type: Schema.Types.ObjectId, ref: "Household", required: true },
  reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reportedUserId: { type: Schema.Types.ObjectId, ref: "User" },

  apartmentId: { type: Schema.Types.ObjectId, ref: "Listing" },
  type: {
    type: String,
    enum: ["apartment", "billing", "safety", "bug", "other"],
    default: "other"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "closed"],
    default: "open"
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  attachments: [
    {
      url: String,
      name: String,
      mimeType: String
    }
  ],
  assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
  messages: [
    {
      authorId: { type: Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  auditTrail: [
    {
      action: String,
      byUserId: { type: Schema.Types.ObjectId, ref: "User" },
      note: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });



module.exports = {
  User: mongoose.model("User", UserSchema),
  Household: mongoose.model("Household", HouseholdSchema),
  Listing: mongoose.model("Listing", ListingSchema),
  SavedListing: mongoose.model("SavedListing", SavedListingSchema),
  Message: mongoose.model("Message", MessageSchema),
  Bill: mongoose.model("Bill", BillSchema),
  CalendarEvent: mongoose.model("CalendarEvent", CalendarEventSchema),
  Chore: mongoose.model("Chore", ChoreSchema),
  SupportTicket: mongoose.model("SupportTicket", SupportTicketSchema)
};
