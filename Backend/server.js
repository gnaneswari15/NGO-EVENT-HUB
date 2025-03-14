// Import express module
const exp = require("express");
const app = exp();

// Enable CORS
const cors = require("cors");
app.use(
  cors({
    origin: "https://ngo-event-hub.vercel.app",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.use(exp.json());

// Import MongoClient
const { MongoClient } = require("mongodb");

// MongoDB connection string
const mongoURI = "mongodb+srv://nikitha_1710:nikitha1710@cluster0.e2laqer.mongodb.net/?retryWrites=true&w=majority";

// Create MongoClient object
const mClient = new MongoClient(mongoURI);

// Connect to MongoDB server
mClient
  .connect()
  .then((connectionObj) => {
    // Connect to a database
    const fsddb = connectionObj.db("ngo-event-hub");

    // Connect to collections
    const usersCollection = fsddb.collection("users");
    const eventsCollection = fsddb.collection("events");

    // Share collection object with APIs
    app.set("usersCollection", usersCollection);
    app.set("eventsCollection", eventsCollection);

    console.log("DB connection success");

    // Import userApp & eventApp express object AFTER DB is connected
    const userApp = require("./APIs/userApi");
    const eventApp = require("./APIs/eventApi");
    const uploadRoute = require("./APIs/upload");

    // Forward requests starting with /user-api to userApp
    app.use("/user-api", userApp);
    app.use("/event-api", eventApp);
    app.use("/image-api", uploadRoute);

    // Handle invalid paths
    app.use("*", (req, res) => {
      res.status(404).send({ message: `Invalid path` });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send({ message: "Error occurred", errorMessage: err.message });
    });

    // Start the server ONLY after DB connection
    const PORT = 4000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error in DB connection", err);
  });