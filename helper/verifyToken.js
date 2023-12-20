const { Firestore } = require('@google-cloud/firestore');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const serviceAccount = require('../sembagoKey.json');
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

async function verifyToken(context) {
  let token;
  let authHeader = context.headers.Authorization || context.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];

    try {
      const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log('The logged-in user info:', user);

      // Assuming you have a 'users' collection in Firestore
      const userCollection = db.collection('users');
      const snapshot = await userCollection.where('_id', '==', user._id).get();

      if (snapshot.empty) {
        console.log('User not found in Firestore');
        return null;
      }

      return user;
    } catch (err) {
      console.error('Error verifying token:', err.message);
      return null;
    }
  }

  if (!token) {
    return null;
  }
}

module.exports.verifyToken = verifyToken;