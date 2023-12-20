const express = require('express');
const bcrypt = require('bcrypt');
const { Firestore, Timestamp } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log('Received params:', req.body);

    const { name, email, nomor_telepon, alamat, password } = req.body;

    if (!name || !email || !nomor_telepon || !alamat || !password) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!nomor_telepon) missingFields.push('nomor_telepon');
      if (!alamat) missingFields.push('alamat');
      if (!password) missingFields.push('password');

      res.status(400).json({ message: `Fields ${missingFields.join(', ')} are mandatory` });
      return;
    }

    const userCollection = db.collection('user');

    // Check if user with the given email already exists
    const userExist = await userCollection.doc(email).get();
    if (userExist.exists) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password || '', 10);

    // Add the new user to the collection with the email as the ID
    await userCollection.doc(email).set({
      user_Id: email, // Gunakan email sebagai ID
      name,
      email,
      nomor_telepon,
      alamat,
      password: hashedPassword,
      isAdmin: false,
    });

    // Retrieve the created user document
    const result = await userCollection.doc(email).get();

    console.log('The result is:', result.data());
    res.status(201).json({ result: result.data() });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
