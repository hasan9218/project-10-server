const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://plate-share-db:03tK1G1650uv5eal@cluster0.vz0nmoq.mongodb.net/food-db?appName=Cluster0";

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB Connected Successfully");

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

    

    

   

    

    
    

    

    

    

    
    await client.db("admin").command({ ping: 1 });
    console.log("🏓 Pinged MongoDB — Connection OK!");
  } catch (error) {
    console.error("🚫 MongoDB connection error:", error);
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
