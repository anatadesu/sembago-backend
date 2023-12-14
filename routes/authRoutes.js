const express = require('express');
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../authkey.json');

router.post('/register', async (req, res) => {
  const firestore = new Firestore({
    projectId: serviceAccount.project_id,
    credentials: serviceAccount,
  });

  const usersCollection = firestore.collection('users');
  const authController = require('../controllers/authControllers')(firestore, usersCollection);

  await authController.register(req, res);
});

router.post('/login', async (req, res) => {
  const firestore = new Firestore({
    projectId: serviceAccount.project_id,
    credentials: serviceAccount,
  });

  const usersCollection = firestore.collection('users');
  const authController = require('../controllers/authControllers')(firestore, usersCollection);

  await authController.login(req, res);
});

// Export a function that takes the Firestore instance and returns the router
module.exports = function (firestoreInstance) {
  return router;
};
