const express = require('express');
const { Firestore, Timestamp } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

const router = express.Router();

router.post('/addProduct', async (req, res) => {
  try {
    const { name, category, description, imageLink, price, alamat, latitude, longitude } = req.body;

    // Validate input data
    if (!name || !price || !category || isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        'error': 'Name, price, category, latitude, and longitude are required and must be valid numbers.',
      });
      return;
    }

    // Convert latitude and longitude to numbers
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    // Check if latitude and longitude are valid numbers
    if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
      res.status(400).json({
        'error': 'Latitude and longitude must be valid numbers.',
      });
      return;
    }

    // Save product data to Firestore in the "product" collection
    const productCollection = db.collection('product');
    const productDoc = productCollection.doc(name);

    // Check if a product with the same ID already exists
    const existingProduct = await productDoc.get();

    if (existingProduct.exists) {
      res.status(400).json({
        'error': 'Product already exists.',
      });
      return;
    }

    // Save product data to Firestore
    const timestamp = Timestamp.now();
    await productDoc.set({
      name,
      category,
      description,
      imageLink,
      price,
      alamat,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      timestamp,
    });

    res.status(201).json({
      'message': 'Product added successfully',
      'productId': name,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      'error': error.message,
    });
  }
});

module.exports = router;
