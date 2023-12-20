module.exports = (firestore, usersCollection) => {
  return {
    register: async (req, res) => {
      try {
        const { username, password } = req.body;

        // Check if the username already exists
        const existingUser = await usersCollection.doc(username).get();
        if (existingUser.exists) {
          return res.status(400).json({ message: 'Username already exists' });
        }

        // Create a new user document
        await usersCollection.doc(username).set({ password });

        res.status(201).json({ message: 'User registered successfully' });
      } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    },

    login: async (req, res) => {
      try {
        const { username, password } = req.body;

        // Retrieve the user document from Firestore
        const userDoc = await usersCollection.doc(username).get();

        if (userDoc.exists && userDoc.data().password === password) {
          res.json({ message: 'Login successful' });
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    },
  };
};