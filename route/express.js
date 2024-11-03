var express = require("express");
var router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = function(db) {
    const lessonsCollection = db.collection("lessons");
    const ordersCollection = db.collection("orders"); 

    // Route to get all lessons
    router.get("/lessons", async function(req, res) {
        try {
            const lessons = await lessonsCollection.find().toArray(); // Fetch all lessons from MongoDB
            res.json(lessons);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving lessons");
        }
    });

    // Route to get a lesson by ID
    router.get("/lessons/:id", async function(req, res) {
        const id = parseInt(req.params.id, 10);
        try {
            const lesson = await lessonsCollection.findOne({ id: id });
            if (lesson) {
                res.json(lesson); // Return the lesson as JSON if found
            } else {
                res.status(404).send("Resource not found"); // Send 404 if lesson not found
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving lesson");
        }
    });

// Route to add a new lesson
router.post("/lessons", async function(req, res) {
    const newLesson = req.body; // Get the lesson data from the request body
    try {
        const result = await lessonsCollection.insertOne(newLesson); // Insert the new lesson into MongoDB
        if (result.insertedCount = 1) {
            // If insertion is successful, return the inserted lesson
            const insertedLesson = await lessonsCollection.findOne({ _id: result.insertedId });
            return res.status(201).json(insertedLesson); // Return the inserted lesson and exit
        } else {
            return res.status(500).send("Error saving lesson"); // Return an error message if insertion fails
        }
    } catch (err) {
        console.error("Error during lesson insertion:", err); // Log the error
        return res.status(500).send("Error  lesson"); // Return an error message if an error occurs
    }
});

// Route to update a lesson by ID
router.put("/lessons/:id", async function(req, res) {
    const id = parseInt(req.params.id, 10); // Parse the lesson ID from the URL
    const updateData = req.body; // Get the update data from the request body

    try {
        const result = await lessonsCollection.updateOne({ id: id }, { $set: updateData }); // Update the lesson in MongoDB
        if (result.matchedCount === 0) {
            return res.status(404).send("Lesson not found"); // Return 404 if no lesson matches the ID
        }
        res.status(200).send("Lesson updated successfully"); // Return success message
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating lesson"); // Return error message if an error occurs
    }
});

//get orders
router.get("/orders", async function(req, res) {
    try {
        const orders = await ordersCollection.find().toArray(); // Fetch all lessons from MongoDB
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving orders");
    }
});
// Route to add a new order
router.post("/orders", async function(req, res) {
    const newOrder = req.body; // Get the order data from the request body
    try {
        const result = await ordersCollection.insertOne(newOrder); // Insert the new order into MongoDB
        if (result.insertedCount = 1) {
            const insertedOrder = await ordersCollection.findOne({ _id: result.insertedId });
            return res.status(201).json(insertedOrder); // Return the inserted order
        } else {
            return res.status(500).send("Error saving order");
        }
    } catch (err) {
        console.error("Error during order insertion:", err);
        return res.status(500).send("Error saving order");
    }
});

router.get('/search', async (req, res) => {
    const searchTerm = req.query.q; // Get the search term from the query parameters

    if (!searchTerm) {
        return res.status(400).send("Search term is required");
    }

    try {
        const priceNumber = parseFloat(searchTerm);
        const inventoryNumber = parseInt(searchTerm, 10);
        // First, try to find exact matches
        const exactMatches = await lessonsCollection.find({
            $or: [
                { subject: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } },
                { price: priceNumber }, // Match exact price
                { availableInventory: inventoryNumber }
            ]
        }).toArray();

        // If exact matches are found, return them
        if (exactMatches.length > 0) {
            return res.json(exactMatches);
        }
        // If no exact matches, perform a case-insensitive search
        const lessons = await lessonsCollection.find({
            $or: [
                { subject: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } },
                { price:  priceNumber }, // This is not ideal for numbers
                { availableInventory: inventoryNumber }
            ]
        }).toArray();

        res.json(lessons); // Return the filtered lessons as JSON
    } catch (err) {
        console.error(err);
        res.status(500).send("Error searching for lessons");
    }
});
    return router; // Return the API router
};
