const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.vz0nmoq.mongodb.net/food-db?appName=Cluster0`;

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
  
    console.log("MongoDB Connected");

    const db = client.db("food-db");
    const foodCollection = db.collection("foods");
    const requestCollection = db.collection("requests");

    //  All Food
    app.get("/foods", async (req, res) => {
      try {
        const status = req.query.status;
        const query = status ? { foodStatus: status } : {};
        const foods = await foodCollection.find(query).toArray();
        res.json(foods);
      } catch (error) {
        res.status(500).json({ message: "Error fetching foods", error });
      }
    });

    // Single Food
    app.get("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const food = await foodCollection.findOne({ _id: new ObjectId(id) });
        if (!food) return res.status(404).json({ message: "Food not found" });
        res.json(food);
      } catch (error) {
        res.status(500).json({ message: "Error fetching food", error });
      }
    });

    // Add Food
    app.post("/foods", async (req, res) => {
      try {
        const data = req.body;
        data.foodStatus = data.foodStatus || "Available";
        data.createdAt = new Date();
        const result = await foodCollection.insertOne(data);
        res.json({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).json({ success: false, message: "Error adding food", error });
      }
    });

    // Update Food
    app.put("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;
        const updateDoc = {
          $set: {
            foodName: updateData.foodName,
            foodImage: updateData.foodImage,
            foodQuantity: updateData.foodQuantity,
            pickupLocation: updateData.pickupLocation,
            expireDate: updateData.expireDate,
            additionalNotes: updateData.additionalNotes,
            foodStatus: updateData.foodStatus || "Available",
            updatedAt: new Date(),
          },
        };
        const result = await foodCollection.updateOne(
          { _id: new ObjectId(id) },
          updateDoc
        );
        if (result.modifiedCount > 0) {
          res.json({ success: true, message: "Food updated successfully!" });
        } else {
          res.json({ success: false, message: "No changes made or food not found!" });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: "Error updating food", error });
      }
    });

    // Update Food
    app.patch("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;
        const updateDoc = { $set: { ...updateData, updatedAt: new Date() } };
        const result = await foodCollection.updateOne(
          { _id: new ObjectId(id) },
          updateDoc
        );
        res.json({ success: true, modifiedCount: result.modifiedCount });
      } catch (error) {
        res.status(500).json({ success: false, message: "Error updating food", error });
      }
    });

    // Delete Food
    app.delete("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Error deleting food", error });
      }
    });

    // Submit Food Request
    app.post("/food-requests", async (req, res) => {
      try {
        const request = req.body;
        request.status = "pending";
        request.requestedAt = new Date();
        const result = await requestCollection.insertOne(request);
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Error submitting request", error });
      }
    });

    // All Requests
    app.get("/food-requests/:foodId", async (req, res) => {
      try {
        const foodId = req.params.foodId;
        const requests = await requestCollection
          .find({ foodId })
          .sort({ requestedAt: -1 })
          .toArray();
        res.json(requests);
      } catch (error) {
        res.status(500).json({ message: "Error fetching food requests", error });
      }
    });

    // Requests for MyFoodRequest Page 
    app.get("/user-requests", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.status(400).json({ message: "Email query is required" });

        const requests = await requestCollection
          .find({ userEmail: email })
          .sort({ requestedAt: -1 })
          .toArray();

        // Attach food name
        const requestsWithFoodName = await Promise.all(
          requests.map(async (reqItem) => {
            const food = await foodCollection.findOne({ _id: new ObjectId(reqItem.foodId) });
            return { ...reqItem, foodName: food?.foodName || "Deleted Food" };
          })
        );

        res.json(requestsWithFoodName);
      } catch (error) {
        res.status(500).json({ message: "Error fetching user requests", error });
      }
    });

    // Request Status Accept / Reject
    app.patch("/food-requests/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body;

        // Update request status
        const request = await requestCollection.findOne({ _id: new ObjectId(id) });
        if (!request) return res.status(404).json({ message: "Request not found" });

        await requestCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status, updatedAt: new Date() } }
        );

        //  mark food as donated
        if (status === "accepted") {
          await foodCollection.updateOne(
            { _id: new ObjectId(request.foodId) },
            { $set: { foodStatus: "Donated", updatedAt: new Date() } }
          );
        }

        res.json({ success: true, message: `Request ${status}` });
      } catch (error) {
        res.status(500).json({ message: "Error updating request status", error });
      }
    });

    

    console.log("Pinged MongoDB — Connection OK");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run().catch(console.error);

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
