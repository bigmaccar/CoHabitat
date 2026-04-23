const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const router = require("./router.js");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL;

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGOURL);
        console.log(`MongoDB Connected:  ${conn.connection.host}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

connectDB();

app.use("/api", router);

app.listen(PORT, () => {
    console.log("app is running");
});
