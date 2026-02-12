const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const app = express();

app.use(cors({origin: true}));
app.use(express.json());

app.get("/api/stack/:email", async (req, res) => {
  const {email} = req.params;

  try {
    const docRef = db.collection("stacks").doc(email);
    const doc = await docRef.get();

    if (doc.exists) {
      res.json(doc.data());
    } else {
      res.json({stack: [], lastValue: 0});
    }
  } catch (error) {
    logger.error("Error reading from Firestore", error);
    res.status(500).json({error: "Failed to read data from Firestore"});
  }
});

app.post("/api/stack", async (req, res) => {
  const {email, payload} = req.body;

  if (!email || !payload) {
    return res.status(400).json({error: "Missing email or payload data"});
  }

  try {
    const docRef = db.collection("stacks").doc(email);
    await docRef.set(payload);
    res.json({success: true});
  } catch (error) {
    logger.error("Error writing to Firestore", error);
    res.status(500).json({error: "Failed to write data to Firestore"});
  }
});

exports.api = onRequest(app);
