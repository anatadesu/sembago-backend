const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
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

//** ======================== Get all users ========================
const getAllUsers = async (req, res) => {
  try {
    const snapshot = await usersCollection.where('role', '==', 'user').get();
    const users = snapshot.docs.map(doc => doc.data());
    res.status(StatusCodes.OK).json({ total_users: users.length, users });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

//** ======================== Get single user ========================
const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  try {
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      throw CustomError.NotFoundError("User does not exist");
    }
    const user = userDoc.data();
    // checkPermissions(req.user, user._id); // Hapus autentikasi permision
    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

//** ======================== Show current user ========================
const showCurrentUser = async (req, res) => {
  // Hapus autentikasi user
  res.status(StatusCodes.OK).json({ user: req.user });
};

//** ======================== Update user ========================
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError("Please provide value");
  }
  try {
    const userDoc = await usersCollection.doc(req.user.userId).get();
    if (!userDoc.exists) {
      throw CustomError.NotFoundError("User not found");
    }
    const user = userDoc.data();
    user.name = name;
    user.email = email;
    await usersCollection.doc(req.user.userId).set(user);
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

//** ======================== Update user password ========================
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both values");
  }
  try {
    const userDoc = await usersCollection.doc(req.user.userId).get();
    if (!userDoc.exists) {
      throw CustomError.NotFoundError("User not found");
    }
    const user = userDoc.data();
    // const isPasswordCorrect = (user.password === oldPassword); // Implement your password comparison logic here
    // if (!isPasswordCorrect) {
    //   throw new CustomError.UnauthenticatedError("Wrong password provided");
    // }
    user.password = newPassword;
    await usersCollection.doc(req.user.userId).set(user);
    res.status(StatusCodes.OK).json({ msg: "Success! Password Updated" });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
