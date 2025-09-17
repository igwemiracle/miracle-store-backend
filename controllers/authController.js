const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');


const register = async (req, res) => {
  const { email, name, password, role } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  // Only allow role assignment via Postman or backend (not frontend forms)
  let userRole = 'user';

  if (req.body.role === 'admin') {
    // Optional: add extra protection so only backend or authorized devs can set this
    if (process.env.ALLOW_ADMIN_REGISTRATION === 'true') {
      userRole = 'admin';
    }
  }

  const user = await User.create({ name, email, password, role: userRole });
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};



// Login User (any user)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new CustomError.BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError.UnauthenticatedError('Invalid credentials: user does not exist');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError('Invalid credentials: incorrect password');
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.OK).json({ user: tokenUser });

  } catch (error) {
    next(error);
  }
};


// Logout User
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  register,
  login,
  logout,
};