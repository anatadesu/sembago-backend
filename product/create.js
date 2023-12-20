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
    const { title, category, description, imageLink, price, alamat } = req.body;

    if (!title || !price || !category) {
      res.status(400).json({
        'error': 'Title and price are required.'
      });
      return;
    }

    // Simpan data produk ke Firestore dalam koleksi "product"
    const productCollection = db.collection('product');
    const productDoc = productCollection.doc(title);

    // Cek apakah produk dengan ID yang sama sudah ada
    const existingProduct = await productDoc.get();

    if (existingProduct.exists) {
      res.status(400).json({
        'error': 'Product already exists.'
      });
      return;
    }

    // Simpan data produk ke Firestore
    const timestamp = Timestamp.now();
    await productDoc.set({
      title,
      category,
      description,
      imageLink,
      price,
      alamat,
      timestamp,
    });

    res.status(201).json({
      'message': 'Product added successfully',
      'productId': title,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      'error': error.message,
    });
  }
});

module.exports = router;
