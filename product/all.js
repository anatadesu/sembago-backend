const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

const router = express.Router();

router.get('/allProduct', async (req, res) => {
  try {
    const productCollection = db.collection('product');
    const snapshot = await productCollection.get();

    if (snapshot.empty) {
      res.status(404).json({ message: 'No products found' });
      return;
    }

    const product = [];
    snapshot.forEach((doc) => {
      const productData = doc.data();
      product.push({
        productId: doc.id,
        title: productData.title,
        price: productData.price,
        sellerName: productData.sellerName,
        alamat: productData.alamat,
      });
    });

    res.status(200).json({ product });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
