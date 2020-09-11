// Importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";

// App config
const app = express();
const port = process.env.PORT || 9000;

// using pusher who tells backend about a new message
const pusher = new Pusher({
  appId: "YourpusherAppId",
  key: "YourpusherKey",
  secret: "YourpusherSecretKey",
  cluster: "ap2",
  encrypted: true,
});

// middleware
app.use(express.json());
app.use(cors());

// DB config
const connection_url =
  "mongodb+srv://admin:<YourADMINPASSWORD>@cluster0.d7l0l.mongodb.net/whatsappdb?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("DB is connected");

  //   Note: collection should be messagecontents not messagecontent
  const msgCollections = db.collection("messagecontents");
  const changeStream = msgCollections.watch();

  // whenever change happens check that using changeStream
  changeStream.on("change", (change) => {

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error trigger pusher");
    }
  });
});
    
// ????

// API routes
app.get("/", (req, res) => res.status(200).send("Hello world!!"));

// fetching the data(messages)
app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// Api for posting the messages
app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// Listen
app.listen(port, () => console.log(`Listening on localhost: ${port}`));
