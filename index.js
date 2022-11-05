const express = require("express");
const cors = require("cors");
// Jwt
const jwt = require("jsonwebtoken");

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
    const orderCollection = client.db("geniusCar").collection("orders");

    //workinG -------------JWT starT
    app.post("/jwt", (req, res) => {
      const user = req.body;
      //create token
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
    //JWT ----------------- enD

    // service api starT
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
    // service api enD

    //workinG-------------------------------- JWT verify function starT
    function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization;
      ///get token
      if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized access." });
      }
      //after getting code in the header get only the token
      const token = authHeader.split(" ")[1];
      // check validity of the token. Verify hole akta decoded dibe (decrepit here)
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
          if (err) {
            return res.status(403).send({ message: "Forbidden access." });
          }
          req.decoded = decoded; ///set decoded value in the req
          next();
        }
      );
    }
    //------------------------------------------JWT verify function enD

    //Orders api

    //query operator to search order under a gmail
    app.get("/orders", verifyJWT, async (req, res) => {
      //---------------- workinG JWT  starT
      // console.log(req.headers.authorization); // we see the authorization code here send from client site
      const decoded = req.decoded; ///get decoded value from the req
      // console.log("Inside orders API", decoded);
      ////notE we provide token and verify the token if valid now we will decide we get the proper information related to this token
      if (decoded.email !== req.query.email) {
        res.status(401).send({ message: "Unauthorized access." }); //akhn kau http://localhost:5005/orders?email=rkavey5@gmail.com likhe data nite chaile ei error message ta dekhbe
      }
      //---------------- JWT  enD

      // console.log(req.query.email);
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    // orders information will come from the user form //create
    app.post("/orders", verifyJWT, async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    //update user
    app.patch("/orders/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: status,
        },
      };
      const result = await orderCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    //Delete orders
    app.delete("/orders/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });
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
