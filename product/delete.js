const express = require('express');
const bcrypt = require('bcrypt');
const { Firestore, Timestamp } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

const router = express.Router();

router.delete('/deleteProduct/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const productCollection = db.collection('product');

    // Check if product with the given ID exists
    const product = await productCollection.doc(productId).get();
    if (!product.exists) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Delete the product document
    await productCollection.doc(productId).delete();

    res.status(204).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
