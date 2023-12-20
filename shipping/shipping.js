const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');

const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

const router = express.Router();

router.post('/shipping', async (req, res) => {
  try {
    const { orderId, shipping } = req.body;

    if (!orderId || !shipping) {
      res.status(400).json({ message: 'orderId and shipping are required fields' });
      return;
    }

    const orderCollection = db.collection('order');
    const checkoutCollection = db.collection('checkout');

    // Check if order with the given orderId exists
    const orderDoc = await orderCollection.doc(orderId).get();
    if (!orderDoc.exists) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Update shipping status in the order
    await orderDoc.ref.update({ shipping });

    // If shipping is "done", create a checkout entry
    if (shipping === 'done') {
      const checkoutData = {
        orderId,
        status: 'successfully',
        timestamp: Firestore.Timestamp.now(),
      };

      await checkoutCollection.add(checkoutData);
    }

    res.status(200).json({ message: 'Shipping processed successfully' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
