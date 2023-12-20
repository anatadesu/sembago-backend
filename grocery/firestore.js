'use strict';

const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore();
const collection = 'GroceryItem'; // Ganti dengan nama koleksi yang sesuai

// Menampilkan semua produk di database
async function list(limit, token) {
  const snapshot = await db
    .collection(collection)
    .orderBy('name')
    .startAfter(token || '')
    .limit(limit)
    .get();

  if (snapshot.empty) {
    return {
      groceryItems: [],
      nextPageToken: false,
    };
  }

  const groceryItems = [];
  snapshot.forEach((doc) => {
    let item = doc.data();
    item.id = doc.id;
    groceryItems.push(item);
  });

  const q = await snapshot.query.offset(limit).get();

  return {
    groceryItems,
    nextPageToken: q.empty ? false : groceryItems[groceryItems.length - 1].name,
  };
}

// Membuat produk baru atau memperbarui produk yang sudah ada
async function update(id, data) {
  let ref;
  if (id === null) {
    ref = db.collection(collection).doc();
  } else {
    ref = db.collection(collection).doc(id);
  }

  data.id = ref.id;
  data = { ...data };
  await ref.set(data);
  return data;
}

async function create(data) {
  return await update(null, data);
}

// Menampilkan detail produk berdasarkan ID
async function read(id) {
  const doc = await db.collection(collection).doc(id).get();

  if (!doc.exists) {
    throw new Error('No such document!');
  }

  return doc.data();
}

// Menghapus produk berdasarkan ID
async function _delete(id) {
  await db.collection(collection).doc(id).delete();
}

module.exports = {
  create,
  read,
  update,
  delete: _delete,
  list,
};
