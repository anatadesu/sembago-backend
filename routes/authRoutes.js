const express = require('express');
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../authkey.json');
const { PythonShell } = require('python-shell');

router.post('/register', async (req, res) => {
  const firestore = new Firestore({
    projectId: serviceAccount.project_id,
    credentials: serviceAccount,
  });

  const usersCollection = firestore.collection('users');
  const authController = require('../controllers/authControllers')(firestore, usersCollection);

  await authController.register(req, res);
});

router.post('/login', async (req, res) => {
  const firestore = new Firestore({
    projectId: serviceAccount.project_id,
    credentials: serviceAccount,
  });

  const usersCollection = firestore.collection('users');
  const authController = require('../controllers/authControllers')(firestore, usersCollection);

  await authController.login(req, res);
});

router.post('/run-python-algorithm', async (req, res) => {
  console.log('Received POST request to /auth/run-python-algorithm');
  try {
    // Extract data from the request body
    const { user_lat, user_long, data } = req.body;

    // Make sure data is defined and is an array
    if (!user_lat || !user_long || !data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid input data format.' });
    }

    // Prepare input data for the Python script
    const inputData = {
      user_lat,
      user_long,
      data,
    };

    const pythonScriptPath = __dirname + '/astar.py';
    const pythonPath = 'C:/Users/binta/AppData/Local/Programs/Python/Python312/python.exe';
    
    const options = {
      mode: 'text',
      pythonPath,
      pythonOptions: ['-u'],
      scriptPath: '',
      args: [JSON.stringify(inputData)],
    };

    console.log('Before PythonShell.run');
    const results = await PythonShell.run(pythonScriptPath, options);

    console.log('PythonShell finished:', results);
    console.log('After PythonShell.run');

    // Process the results as needed
    // For example, parse JSON and handle the A* algorithm results
    const resultData = results.map(result => JSON.parse(result));
    res.json({ result: resultData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export a function that takes the Firestore instance and returns the router
module.exports = function (firestoreInstance) {
  return router;
};
