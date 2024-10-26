const express = require("express");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
    const keyCollection = database.collection("key");
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

    const { ObjectId } = require("mongodb");

    app.delete("/food/:id", async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const query = { _id: new ObjectId(id) };

      try {
        const result = await userCollection.deleteOne(query);
        if (result.deletedCount === 1) {
          console.log("Item deleted:", result);
          res.json({ message: "Item deleted successfully", result });
        } else {
          res.status(404).json({ error: "Item not found" });
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ error: "Failed to delete item" });
      }
    });
    // Specify the destination folder for uploaded files

    app.put("/food/:id", async (req, res) => {
      const id = req.params.id;
      const { image, foodName, foodPrice, description } = req.body;

      try {
        const result = await userCollection.updateOne(
          { _id: new ObjectId(id) }, // Filter by ID
          {
            $set: {
              image: image,
              foodName: foodName,
              foodPrice: foodPrice,
              description: description,
            },
          }
        );

        if (result.modifiedCount > 0) {
          res.status(200).json({
            status: "success",
            message: "Food item updated successfully",
          });
        } else {
          res.status(404).json({
            status: "failure",
            message: "Food item not found or no changes made",
          });
        }
      } catch (error) {
        console.error("Error updating food item:", error);
        res.status(500).json({
          status: "error",
          message: "An error occurred while updating the food item",
        });
      }
    });

    app.post("/key", async (req, res) => {
      const newUser = req.body;
      const result = await keyCollection.insertOne(newUser);
      res.json(result);
    });

    app.get("/key", async (req, res) => {
      try {
        // Fetch the first document in the collection
        const keyDocument = await keyCollection.findOne({});

        if (keyDocument) {
          res.status(200).json(keyDocument);
        } else {
          res.status(404).json({ message: "Key not found" });
        }
      } catch (error) {
        console.error("Error fetching key:", error);
        res.status(500).json({ message: "Server error" });
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
