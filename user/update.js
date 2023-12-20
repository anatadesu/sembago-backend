const express = require('express');
const { Firestore, Timestamp } = require('@google-cloud/firestore');
const bcrypt = require('bcrypt');
const serviceAccount = require('../sembagoKey.json');

const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

const router = express.Router();

router.put('/edit', async (req, res) => {
  const { user_Id, name, email, nomor_telepon, alamat } = req.body;
  
  // Check if user_Id, name, and email are provided
  if (!user_Id || (!name && !email)) {
    res.status(400).json({ message: 'user_Id, name, and/or email are required for update' });
    return;
  }

  const userCollection = db.collection('user');

  try {
    const userDoc = await userCollection.doc(user_Id).get();

    if (!userDoc.exists) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update user data
    const userData = userDoc.data();

    if (name) {
      userData.name = name;
    }

    if (email) {
      userData.email = email;
    }

    if (nomor_telepon) {
      userData.nomor_telepon = nomor_telepon;
    }

    if (alamat) {
      userData.alamat = alamat;
    }

    await userDoc.ref.set(userData);

    res.status(200).json({ message: 'User data updated successfully', updatedUser: userData });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
