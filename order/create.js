const express = require('express');
const { Firestore, Timestamp } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

const router = express.Router();

router.post('/addOrder', async (req, res) => {
  try {
    const { products, amount, address } = req.body;

    if (!products || !amount || !address) {
      res.status(400).json({ message: 'Products, amount, and address are mandatory' });
      return;
    }

    const orderCollection = db.collection('order');
    const productCollection = db.collection('product'); // Collection of products

    // Assuming products is an array of product IDs
    const productPromises = products.map(async (productId) => {
      const productDoc = await productCollection.doc(productId).get();
      if (!productDoc.exists) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      return productDoc.data();
    });

    const retrievedProducts = await Promise.all(productPromises);

    // Create order object
    const order = {
      products: retrievedProducts,
      amount,
      address,
      status: 'pending', // Default status
      timestamp: Timestamp.now(),
    };

    // Save order to Firestore
    const newOrderRef = await orderCollection.add(order);
    const newOrderId = newOrderRef.id; // Get the ID of the newly created order
    await newOrderRef.update({ orderId: newOrderId }); // Update the order with orderId

    const newOrderDoc = await newOrderRef.get();
    const result = newOrderDoc.data();

    res.status(201).json({ result });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
