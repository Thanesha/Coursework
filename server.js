const express = require("express");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const cors = require('cors'); // Import cors

const apiRouter = require("./route/express"); // Import the API router

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors());

// MongoDB connection
const url = 'mongodb+srv://Th660:UcY1CUjA9tv7jVpW@cluster0.cxk7ils.mongodb.net/';
const client = new MongoClient(url);
let db;

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        db = client.db("Coursework1"); // Replace with your database name
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

// Start the server and connect to the database
async function startServer() {
    await connectDB(); // Ensure the database is connected

    // Use the API router with the "/api" prefix
    app.use("/api", apiRouter(db)); // Pass the db instance to the router

    // Middleware to log incoming requests
    app.use(function(req, res, next) {
        console.log("Request URL: " + req.url);
        next();
    });

    // Middleware to serve image files
    app.use("/images", function(req, res, next) {
        const filePath = path.join(__dirname, "images", req.url);
        fs.stat(filePath, function(err, fileInfo) {
            if (err) {
                next(); // go to the next middleware if the file doesn't exist
                return;
            }
            if (fileInfo.isFile()) {
                res.sendFile(filePath); // send the file if it exists
            } else {
                next(); // go to the next middleware if it's not a file
            }
        });
    });

    // Middleware for handling 404 errors
    app.use(function(req, res) {
        res.status(404).send("Resource not found"); // send 404 error message
    });

    // Start the server
    app.listen(8080, function() {
        console.log("App started on port 8080");
    });
}

startServer(); // Start the server and connect to MongoDB