const express = require('express');
const { Firestore, Timestamp } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');
const { PythonShell } = require('python-shell');

const router = express.Router();
const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './sembagoKey.json',
});

// Route to perform A* algorithm and store the result in Firestore
router.post('/nearProduct', async (req, res) => {
  console.log('Received POST request to ./astar.py');
  try {
    // Extract data from the request body
    const { user_lat, user_long, category } = req.body;

    // Check if data is defined
    if (!user_lat || !user_long || !category) {
      return res.status(400).json({ error: 'Invalid input data format. Please provide user_lat, user_long, and category.' });
    }

    // Check if user_lat and user_long are valid numbers
    if (typeof user_lat !== 'number' || typeof user_long !== 'number') {
      return res.status(400).json({ error: 'Invalid input data format. user_lat and user_long must be numbers.' });
    }

    // Retrieve products from Firestore based on the input category
    const productsSnapshot = await db.collection('product').where('category', '==', category).get();

    // Extract relevant data from the Firestore documents
    const data = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      latitude: doc.data().latitude,
      longitude: doc.data().longitude,
    }));

    // Check if any products were found
    if (data.length === 0) {
      return res.status(404).json({ error: 'No products found for the specified category.' });
    }

    // Prepare input data for the Python script
    const inputData = {
      user_lat,
      user_long,
      data,
    };

    console.log('Input data to Python script:', inputData);

    const pythonScriptPath = __dirname + '/astar.py';

    const options = {
      mode: 'text',
      scriptPath: '',
      args: [JSON.stringify(inputData)],
    };

    // Use python-shell to find Python path automatically
    const pyshell = new PythonShell(pythonScriptPath, options);
    const pythonPath = pyshell.pythonPath;

    console.log('Before PythonShell.run');
    const results = await PythonShell.run(pythonScriptPath, { ...options, pythonPath });

    console.log('PythonShell finished:', results);
    console.log('After PythonShell.run');

    // Process the results as needed
    // For example, parse JSON and handle the A* algorithm results
    const resultData = results.map(result => {
      try {
        return JSON.parse(result);
      } catch (error) {
        console.error('Error parsing result JSON:', error);
        return { error: 'Invalid JSON format in result.' };
      }
    });

    // Save the resultData to Firestore
    const resultCollectionRef = db.collection('resultAstar');
    await resultCollectionRef.add({
      timestamp: Timestamp.now(),
      result: resultData,
    });

    // Fetch products based on goal names in the result and display their details
    const matchingProducts = [];

    for (const resultItem of resultData) {
      const goalName = resultItem.goal;

      const matchingProduct = data.find(product => product.name === goalName);

      if (matchingProduct) {
        matchingProducts.push({
          ...matchingProduct,
          dist_km: resultItem.dist_km,
        });
      }
    }

    // Return the result and matching products
    res.json({ result: resultData, matchingProducts });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get the last saved A* result and matching products
router.get('/resultAstar', async (req, res) => {
  try {
    // Fetch the last saved A* result from Firestore
    const resultQuery = await db.collection('resultAstar').orderBy('timestamp', 'desc').limit(1).get();

    // Check if any result was found
    if (resultQuery.empty) {
      return res.status(404).json({ error: 'No A* result found.' });
    }

    const lastResult = resultQuery.docs[0].data().result;

    // Fetch matching products based on goal names in the result
    const matchingProducts = [];

    for (const resultItem of lastResult) {
      const goalName = resultItem.goal;

      const matchingProduct = await db.collection('product').where('name', '==', goalName).get();

      matchingProduct.forEach(doc => {
        matchingProducts.push({
          id: doc.id,
          name: doc.data().name,
          category: doc.data().category,
          alamat: doc.data().alamat,
          imageLink: doc.data().imageLink,
          price: doc.data().price,
          description: doc.data().description,
          dist_km: resultItem.dist_km,
        });
      });
    }

    // Return the last A* result and matching products
    res.json({ result: matchingProducts });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
