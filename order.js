// order.js
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const connection = require('./mysqlConfig'); // Gantilah dengan file konfigurasi MySQL atau Google Cloud SQL

router.use(bodyParser.json());

// Endpoint untuk membuat pesanan baru
router.post('/place-order', (req, res) => {
  const { product, quantity, customerName } = req.body;

  const sql = 'INSERT INTO orders (product, quantity, customer_name) VALUES (?, ?, ?)';
  connection.query(sql, [product, quantity, customerName], (err, results) => {
    if (err) {
      console.error('Error placing order:', err);
      res.status(500).send('Error placing order');
      return;
    }
    res.status(201).send('Order placed successfully');
  });
});

module.exports = router;
