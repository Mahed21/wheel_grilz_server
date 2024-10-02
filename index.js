const express = require("express");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const cors = require("cors");
const { ObjectId } = require("mongodb");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pszjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("grillz");
    const userCollection = database.collection("food");
    console.log("connected");

    app.post("/food", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.json(result);
    });

    app.get("/food", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    //delete

    app.delete("/food/:id", async (req, res) => {
      const id = req.params.id;

      // Make sure the id is a valid ObjectId before proceeding
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid ID format" });
      }

      const query = { _id: new ObjectId(id) }; // Use `new ObjectId(id)` if necessary
      const result = await userCollection.deleteOne(query);

      if (result.deletedCount === 1) {
        res.send({ success: true, message: "Food item deleted successfully!" });
      } else {
        res.status(404).send({ message: "Food item not found" });
      }
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
