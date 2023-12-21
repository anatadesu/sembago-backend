const express = require('express');
const { Firestore, Timestamp } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

const router = express.Router();

// Route to delete a document by ID
router.delete('/deleteDocument/:documentId', async (req, res) => {
  try {
    const documentId = req.params.documentId;

    if (!documentId) {
      return res.status(400).json({ error: 'Invalid document ID provided.' });
    }

    // Reference to the document
    const documentRef = db.collection('product').doc(documentId);

    // Check if the document exists before attempting to delete
    const documentSnapshot = await documentRef.get();

    if (!documentSnapshot.exists) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Delete the document
    await documentRef.delete();

    res.status(200).json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/product/:category/products', async (req, res) => {
  try {
    const category = req.params.category;

    if (!category) {
      return res.status(400).json({ error: 'Invalid category provided.' });
    }

    // Reference to the collection
    const collectionRef = db.collection('product').doc(category).collection('products');

    // Get all documents in the collection
    const querySnapshot = await collectionRef.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'No documents found in the collection.' });
    }

    // Delete each document
    const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    res.status(200).json({ message: 'All documents deleted successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
