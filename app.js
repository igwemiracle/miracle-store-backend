require('dotenv').config();
const cron = require('node-cron');

// express
require('express-async-errors');
const express = require('express');
const cors = require('cors'); // Enables Cross-Origin Resource Sharing (CORS) for frontend-backend communication.
const app = express();


// rest of the packages
const morgan = require('morgan'); // Logs HTTP requests to the console (for debugging).
const cookieParser = require('cookie-parser'); // Parses cookies attached to client requests.
const rateLimiter = require('express-rate-limit'); // Limits request rates to prevent API abuse (security).
const helmet = require('helmet'); // Adds security headers to protect against common attacks.
const xss = require('xss-clean'); // Prevents cross-site scripting (XSS) attacks.
const mongoSanitize = require('express-mongo-sanitize'); // Prevents NoSQL injection attacks by sanitizing MongoDB queries.
const path = require('path');


//  routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoute');
const productRouter = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');
const cartRouter = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const promotionRoutes = require('./routes/PromotionalRoutes');
const cardsConfigRoutes = require('./routes/cardsConfigRoutes');

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const { runAutoCardConfigUpdate } = require("./utils/updateCardsConfig");

app.set('trust proxy', 1);
const isDev = process.env.NODE_ENV !== 'production';

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 1000 : 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);


// For development
app.use(morgan('dev'));

// For production (detailed logs)
app.use(morgan('combined'));


app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',              // local dev
  'mira-store-frontend-y9kd.vercel.app'    // Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));



app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));


app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve images

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/cart-items', cartRouter);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/shipping', shippingRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/cardsConfig', cardsConfigRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

cron.schedule('0 3 * * *', async () => {
  console.log("🕒 [TEST MODE] Running scheduled updateCardsConfig at 3 AM");
  try {
    await runAutoCardConfigUpdate();
    console.log("✅ Cards config refreshed");
  } catch (err) {
    console.error("❌ Error updating cards config:", err.message);
  }
});

// database
const connectDB = require('./db/connect');
const port = process.env.PORT || 5000;

// Start the server and connect to the database
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};
start();
