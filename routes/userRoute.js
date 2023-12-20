const express = require("express");
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../sembagoKey.json');

// Inisialisasi koneksi Firestore
const firestoreInstance = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
});

// Middleware untuk mengakses koleksi pengguna pada Firestore
const usersCollection = firestoreInstance.collection('users');

// Import fungsi-fungsi dari userController
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

// Middleware untuk mendapatkan semua pengguna (tanpa autentikasi)
router.get("/", getAllUsers);

// Middleware untuk mendapatkan pengguna tunggal berdasarkan ID (tanpa autentikasi)
router.get("/:id", getSingleUser);

// Middleware untuk menampilkan pengguna saat ini (tanpa autentikasi)
router.get("/showMe", showCurrentUser);

// Middleware untuk memperbarui informasi pengguna (tanpa autentikasi)
router.patch("/updateUser", updateUser);

// Middleware untuk memperbarui kata sandi pengguna (tanpa autentikasi)
router.patch("/updateUserPassword", updateUserPassword);

module.exports = router;
