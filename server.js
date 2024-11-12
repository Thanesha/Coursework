const express = require("express");
const path = require("path");
const fs = require("fs");
const { MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const cors = require('cors'); // Import cors
const allowedOrigins = ['https://thanesha.github.io']; // Add your GitHub Pages URL here
const apiRouter = require("./route/express"); // Import the API router

const propertiesReader = require('properties-reader');
const properties = propertiesReader('mongo.properties');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    credentials: true // Allow credentials if needed
}));

const dbprefix = properties.get('db.prefix');
const dbhost = properties.get('db.host');
const dbname = properties.get('db.name');
const dbuser = properties.get('db.user');
const dbpassword= properties.get('db.password');
const dbParams = properties.get('db.Params');
// MongoDB connection
const url = `${dbprefix}${dbuser}:${dbpassword}@${dbhost}${dbname}${dbParams}` ;
const client = new MongoClient(url, { serverapi: ServerApiVersion.v1});
 let db;

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        db = client.db("Coursework1"); // database
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}
app.param('collectionName', function(req, res, next, collectionName) { req.collection = db.collection(collectionName); return next(); });
// Start the server and connect to the database
async function startServer() {
    await connectDB(); // Ensure the database is connected

    // Middleware to log incoming requests
    app.use(function(req, res, next) {
        console.log("Request URL: " + req.url);
        next();
    });

    app.use("/api", apiRouter(db)); // Pass the db instance to the router
    app.use("/images", express.static(path.join(__dirname, "images")));

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
        res.status(404).send("File not found"); // send 404 error message
    });

    // Start the server
    app.listen(8080, function() {
        console.log("App started on port 8080");
    });
}

startServer(); // Start the server and connect to MongoDB
