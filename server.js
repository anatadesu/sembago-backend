const express = require('express');
const bodyParser = require('body-parser');
const { Firestore } = require('@google-cloud/firestore');

const serviceAccount = require('./authkey.json');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const firestoreInstance = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: serviceAccount,
});

// Import the authRoutes module and call it with the Firestore instance
const authRoutes = require('./routes/authRoutes')(firestoreInstance);

app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
