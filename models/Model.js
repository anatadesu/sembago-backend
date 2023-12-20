const { Firestore } = require('@google-cloud/firestore');


// Replace 'path/to/sembago-key.json' with the actual path to your service account key
const serviceAccount = require('../config/sembagoKey.json');

const firestore = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: './config/sembagoKey.json',
});

const groceryItemModel = async (itemId, itemName, itemCategory, itemPrice, itemLocation, itemRating) => {
  try {
    const groceryItemsCollection = firestore.collection('groceryItems');

    const newItemRef = groceryItemsCollection.doc(itemId);
    await newItemRef.set({
      id: itemId,
      name: itemName,
      category: itemCategory,
      price: itemPrice,
      location: itemLocation,
      rating: itemRating,
    });

    console.log('Grocery item added to Firestore');
  } catch (error) {
    console.error('Error adding grocery item to Firestore:', error);
  }
};

// Export the model
module.exports = groceryItemModel;