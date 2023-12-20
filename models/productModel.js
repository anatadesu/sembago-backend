const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

const createProduct = async (data) => {
  try {
    const productRef = firestore.collection('products').doc();
    await productRef.set(data);
    return { id: productRef.id, ...data };
  } catch (error) {
    console.error('Error creating product in Firestore:', error);
    throw error;
  }
};

const getProductById = async (id) => {
  try {
    const productDoc = await firestore.collection('products').doc(id).get();
    if (!productDoc.exists) {
      return null;
    }
    return { id: productDoc.id, ...productDoc.data() };
  } catch (error) {
    console.error('Error getting product from Firestore:', error);
    throw error;
  }
};

const getProductsByUser = async (userId) => {
  try {
    const productsQuery = await firestore.collection('products').where('user', '==', userId).get();
    const products = [];
    productsQuery.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    console.error('Error getting products from Firestore:', error);
    throw error;
  }
};

const updateProduct = async (id, data) => {
  try {
    const productRef = firestore.collection('products').doc(id);
    await productRef.update(data);
    return { id, ...data };
  } catch (error) {
    console.error('Error updating product in Firestore:', error);
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    const productRef = firestore.collection('products').doc(id);
    await productRef.delete();
  } catch (error) {
    console.error('Error deleting product in Firestore:', error);
    throw error;
  }
};

module.exports = {
  createProduct,
  getProductById,
  getProductsByUser,
  updateProduct,
  deleteProduct,
};
