const router = require("express").Router();
const { Firestore } = require('@google-cloud/firestore');
const path = require('path'); // Ensure 'path' module is required
const serviceAccount = require(path.join(__dirname, '../config/sembagoKey.json'));
const Model = require("../models/Model");
const Product = require('../models/Model');
const firestore = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: path.join(__dirname, '../config/sembagoKey.json'),
});

const firestoreClient = require('../FirestoreClient');
const firestoreInstance = new Firestore({
  projectId: serviceAccount.sembago,
  keyFilename: './sembagoKey.json',
});

router.get("/groceryItems", async (req, res) => {
  try {
    const page = parseInt(req.query.page) - 2 || 0;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";
    const sort = req.query.sort || "name";
    const category = req.query.category || "All";

    // Fetch data from Firestore
    const collectionRef = firestore.collection('groceryItem');
    const snapshot = await collectionRef.get();

    // Check if data is not found
    if (snapshot.empty) {
      return res.status(404).json({ error: true, message: "Data not found in Firestore" });
    }

    // Process Firestore documents
    const groceryItems = [];
    snapshot.forEach(doc => {
      const item = doc.data();
      groceryItems.push(item);
    });

    const categoryOptions = [
      "Fruits",
      "Vegetables",
      "Dairy",
      "Meat",
      "Beverages",
      "Bakery",
      "Snacks",
      "Canned Goods",
      "Frozen Foods",
      "Others",
    ];

    const selectedCategories = category === "All" ? categoryOptions : category.split(",");

    const filteredItems = groceryItems.filter(item => {
      return (
        item.name.toLowerCase().includes(search.toLowerCase()) &&
        (selectedCategories.includes(item.category) || selectedCategories.includes("All"))
      );
    });

    const sortedItems = filteredItems.sort((a, b) => {
      if (sort === "name") {
        return a.name.localeCompare(b.name);
      } else if (sort === "category") {
        return a.category.localeCompare(b.category);
      } else {
        return a[sort] - b[sort];
      }
    });

    const total = sortedItems.length;

    const slicedItems = sortedItems.slice(page * limit, (page + 1) * limit);

    const response = {
      error: false,
      total,
      page: page + 1,
      limit,
      categories: categoryOptions,
      groceryItems: slicedItems,
    };

    res.status(200).send({ message: 'Grocery route is working!', response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: err.message || "Internal Server Error" });
  }
});

router.post("/addData", async (req, res) => {
  try {
    // Get data from the request body
    const { docName, additionalField, subColName, subColData } = req.body;

    // Specify the collection name
    const collection = 'sembago';

    // Prepare data to be saved
    const data = {
      docName: docName,
      additionalField: additionalField,
      // Add other fields as needed
    };

    // Use the firestoreClient to save the main data
    await firestoreClient.save(collection, data);

    // Use the firestoreClient to save the subcollection data
    await firestoreClient.saveSubCollection(collection, docName, subColName, subColData);

    res.status(201).json({ error: false, message: 'Data added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});


router.post("/addSubcollection", async (req, res) => {
  try {
    // Get data from the request body
    const { docName, reviewField } = req.body;

    // Specify the root collection, root document, subcollection, and data to be saved
    const rootCol = 'groceryItem';
    const rootDocName = docName; // Assuming docName is the root document name
    const subCol = 'review';
    const subColData = {
      docName: 'subDocName', // Specify the subcollection document name
      reviewField: reviewField,
      // Add other fields as needed
    };

    // Use the firestoreClient to save the subcollection data
    await firestoreClient.saveSubCollection(rootCol, rootDocName, subCol, subColData);

    res.status(201).json({ error: false, message: 'Subcollection added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

module.exports = router;
