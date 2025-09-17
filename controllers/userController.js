const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils');


const promoteToAdmin = async (req, res) => {
  const { id: userIdToPromote } = req.params;

  const user = await User.findById(userIdToPromote);
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${userIdToPromote}`);
  }

  if (user.role === 'admin') {
    throw new CustomError.BadRequestError('User is already an admin');
  }

  user.role = 'admin';
  await user.save();

  res.status(200).json({ message: 'User promoted to admin', user });
}



const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// update user with user.save()
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Find the user
  const user = await User.findById(id);
  if (!user) {
    throw new CustomError.NotFoundError(`No user found with id: ${id}`);
  }

  // Delete related data (Cart, Orders, Wishlist)
  await Cart.deleteOne({ user: id });
  await Order.deleteMany({ user: id });
  await Wishlist.deleteOne({ user: id });

  // Delete the user
  await User.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({ msg: 'User deleted successfully' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  promoteToAdmin
};
