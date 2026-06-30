const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'flutter_notifications';
const COLLECTION_NAME = 'notifications';

let db;
let notificationsCollection;

async function connectMongoDB() {
  if (db) return;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  notificationsCollection = db.collection(COLLECTION_NAME);
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: "Server is running" });
});


app.post('/api/notifications', async (req, res) => {
  await connectMongoDB();
  const { title, text, package: pkg, timestamp, formattedTime } = req.body;

  const result = await notificationsCollection.insertOne({
    title,
    text,
    package: pkg,
    timestamp: new Date(timestamp),
    formattedTime,
    savedAt: new Date(),
  });

  res.json({ success: true, id: result.insertedId });
});

app.get('/api/notifications', async (req, res) => {
  await connectMongoDB();
  const notifications = await notificationsCollection
    .find()
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();

  res.json({ success: true, notifications });
});

module.exports = app;
