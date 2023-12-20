const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
require('dotenv').config({ path: '.env' });
const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'All fields are mandatory' });
    return;
  }

  const userCollection = db.collection('user');

  try {
    const userQuery = await userCollection.doc(email).get();

    if (!userQuery.exists) {
      res.status(401).json({ message: 'Email or password is not valid' });
      return;
    }

    const userData = userQuery.data();
    const storedPassword = userData.password; // Password yang disimpan di Firestore

    // Memeriksa kecocokan password
    const matchPassword = await bcrypt.compare(password, storedPassword);

    if (matchPassword) {
      res.status(200).json({ message: 'Login successful', user: userData });
    } else {
      res.status(401).json({ message: 'Email or password is not valid' });
    }
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
