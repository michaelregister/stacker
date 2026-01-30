import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import serviceAccount from './service-account-key.json' assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/stack/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const docRef = db.collection('stacks').doc(email);
    const doc = await docRef.get();

    if (doc.exists) {
      res.json(doc.data());
    } else {
      // Return a default structure for new users
      res.json({ stack: [], lastValue: 0 });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data from Firestore' });
  }
});

app.post('/api/stack', async (req, res) => {
  const { email, payload } = req.body;

  if (!email || !payload) {
    return res.status(400).json({ error: 'Missing email or payload data' });
  }

  try {
    const docRef = db.collection('stacks').doc(email);
    await docRef.set(payload);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write data to Firestore' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
