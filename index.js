const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

app.use(bodyParser.json())

mongoose.connect('mongodb://localhost/food_delivery', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const FoodItem = mongoose.model('FoodItem', {
  name: String,
  description: String,
  price: Number,
});

const Order = mongoose.model('Order', {
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
  status: String,
  timestamp: { type: Date, default: Date.now },
});

const Delivery = mongoose.model('Delivery', {
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },
});

app.use(bodyParser.json());

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

app.get('/api/fooditems', async (req, res) => {
  try {
    const foodItems = await FoodItem.find();
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { userId, foodItemIds } = req.body;

  try {
    const order = new Order({
      user: userId,
      items: foodItemIds,
      status: 'pending',
    });
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const orders = await Order.find({ user: userId }).populate('items');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/orders/:orderId/status', async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/deliveries', async (req, res) => {
  const { orderId, coordinates } = req.body;

  try {
    const delivery = new Delivery({
      orderId,
      location: { coordinates },
    });
    await delivery.save();
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/deliveries/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const delivery = await Delivery.findOne({ orderId });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Placeholder for payment integration (replace with actual payment gateway implementation)
app.post('/api/payment', (req, res) => {
  // Perform payment processing here
  // Placeholder response for testing
  res.json({ success: true, message: 'Payment successful' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});