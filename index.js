const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = 5000

app.use(cors())
app.use(express.json())





const uri = "mongodb+srv://plate-share-db:03tK1G1650uv5eal@cluster0.vz0nmoq.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db('food-db')
    const foodCollection = db.collection('foods')


    // find
    app.get('/foods', async (req, res) => {
        const result = await foodCollection.find().toArray()
        res.send(result)
    })









    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Server is running fine")
})


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})