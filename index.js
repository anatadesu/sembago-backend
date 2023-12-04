const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

app.use(bodyParser.json())

// Define a simple model for food items
const FoodItem = mongoose.model('FoodItem', {
  name: String,
  description: String,
  price: Number,
});

// Middleware
app.use(bodyParser.json());

// Routes
app.get('/api/fooditems', async (req, res) => {
  try {
    const foodItems = await FoodItem.find();
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/fooditems', async (req, res) => {
  const { name, description, price } = req.body;

  try {
    const newFoodItem = new FoodItem({ name, description, price });
    await newFoodItem.save();
    res.json(newFoodItem);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});