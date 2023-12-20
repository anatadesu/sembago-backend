const router = require("express").Router();
const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../config/sembagoKey.json');
const Model = require("../models/Model");
const Product = require('../models/Model'); // Sesuaikan dengan path dan nama file yang benar


const firestore = new Firestore({
  projectId: serviceAccount.sembago,
  keyFilename: '../config/sembagoKey.json',
});

const fs = require('fs');
const path = require('path');
const groceryFilePath = path.join(__dirname, '../config/grocery.json');
const collectionName = 'groceryItem';

router.get("/groceryItems", async (req, res) => {
  try {
    const page = parseInt(req.query.page) - 2 || 0;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";
    const sort = req.query.sort || "name";
    const category = req.query.category || "All";

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

    // Read data from grocery.json
    const groceryData = fs.readFileSync(groceryFilePath, 'utf-8');
    const groceryItems = JSON.parse(groceryData);

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
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

module.exports = router;
