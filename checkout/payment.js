const express = require('express');
const { Firestore, Timestamp } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

const router = express.Router();

router.post('/payment', async (req, res) => {
  try {
    const { userId, paymentMethodType, orderId } = req.body;

    if (!userId || !paymentMethodType || !orderId) {
      res.status(400).json({ message: 'userId, paymentMethodType, and orderId are mandatory' });
      return;
    }

    const orderCollection = db.collection('order');
    const userCollection = db.collection('user');

    // Check if the user exists
    const userDoc = await userCollection.doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if the order exists and is pending
    const orderDoc = await orderCollection.doc(orderId).get();
    if (!orderDoc.exists) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const orderData = orderDoc.data();

    if (orderData.status !== 'pending') {
      res.status(400).json({ message: 'Order is not in pending status' });
      return;
    }

    // Perform payment processing logic here (e.g., handle ATM or e-money)

    // Update order status to 'shipping'
    await orderCollection.doc(orderId).update({ status: 'shipping' });

    res.status(200).json({ message: 'Payment successful, order is now shipping' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
