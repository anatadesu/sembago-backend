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
  const { productId, title, price, sellerName, alamat } = req.body;
  
  // Check if productId, title, and price are provided
  if (!productId || (!title && !price)) {
    res.status(400).json({ message: 'productId, title, and/or price are required for update' });
    return;
  }

  const productCollection = db.collection('product');

  try {
    const productDoc = await productCollection.doc(productId).get();

    if (!productDoc.exists) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Update product data
    const productData = productDoc.data();

    if (title) {
      productData.title = title;
    }

    if (price) {
      productData.price = price;
    }

    if (sellerName) {
      productData.sellerName = sellerName;
    }

    if (alamat) {
      productData.alamat = alamat;
    }

    await productDoc.ref.set(productData);

    res.status(200).json({ message: 'Product data updated successfully', updatedProduct: productData });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
