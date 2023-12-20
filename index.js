const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const sembagoRoute = require("./routes/route")
const app = express();
const port = process.env.PORT || 8080;
const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('./sembagoKey.json');
const dbConnect = require('./dbConect');
const FirestoreClient = require('./FirestoreClient');

const firestoreInstance = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

dbConnect();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

const authRoutes = require('./routes/authRoutes')(firestoreInstance);

app.use('/auth', authRoutes);

app.use("/api", sembagoRoute);
app.get('/', function (req, res) {
  res.status(200).send('Hello World!');
  });


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// getByPath();