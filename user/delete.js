const express = require('express');
const bcrypt = require('bcrypt');
const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

const router = express.Router();

router.delete('/delete', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: 'Email is required for deletion' });
    return;
  }

  const userCollection = db.collection('user');

  try {
    const snapshot = await userCollection.where('email', '==', email).get();

    if (snapshot.empty) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Delete the user
    const deletedUser = snapshot.docs[0];
    await deletedUser.ref.delete();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
