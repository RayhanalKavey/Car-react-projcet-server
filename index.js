const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5005;

// middle ware
app.use(cors());
app.use(express.json()); //Convert data into

//------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hufticd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const serviceCollection = client.db("geniusCar").collection("services");
    // R: read starT
    // Create an API  in the server with get to  Read data in server site,  from database, and send response to the client
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    ///Read a specific service with a new api in server, from database and send response to the client
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    // R: read enD
  } finally {
  }
}
run().catch((error) => console.log(error));
//------------------

app.get("/", (req, res) => {
  res.send(" Welcome to Genius Car Server");
});

app.listen(port, () => {
  console.log(`Genius server is running on port: ${port}`);
});
