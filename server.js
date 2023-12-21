const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(bodyParser.json());

const user = require('./user/register');
const userDelete = require('./user/delete');
const userEdit = require('./user/update');
const login = require('./auth/login');
const addProduct = require('./product/create');
const addOrder = require('./order/create');
const deleteProduct = require('./product/delete');
const productEdit = require('./product/update');
const productAll = require('./product/all');
const addCart = require('./cart/create');
const payment = require('./checkout/payment');
const shipping = require('./shipping/shipping');
const sst = require('./model_rekomendasi/star');
const deleteDoc = require('./product/delete');

app.use('/api', user);
app.use('/api', userDelete);
app.use('/api', userEdit);
app.use('/api', login);
app.use('/api', addOrder);
app.use('/api', addProduct);
app.use('/api', deleteProduct);
app.use('/api', productEdit);
app.use('/api', productAll);
app.use('/api', addCart);
app.use('/api', payment);
app.use('/api', shipping);
app.use('/api', sst);
app.use('/api', deleteDoc);

app.get('/', function (req, res) {
  res.status(200).send('Hello World!');
  });


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});