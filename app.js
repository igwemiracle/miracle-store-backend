require('dotenv').config();

// express
const express = require('express');
const app = express();



// rest of the packages
const morgan = require('morgan'); // Logs HTTP requests to the console (for debugging).
const cookieParser = require('cookie-parser'); // Parses cookies attached to client requests.
const fileUpload = require('express-fileupload'); // Enables handling file uploads (e.g., product images).
const rateLimiter = require('express-rate-limit'); // Limits request rates to prevent API abuse (security).
const helmet = require('helmet'); // Adds security headers to protect against common attacks.
const xss = require('xss-clean'); // Prevents cross-site scripting (XSS) attacks.
const cors = require('cors'); // Enables Cross-Origin Resource Sharing (CORS) for frontend-backend communication.
const mongoSanitize = require('express-mongo-sanitize'); // Prevents NoSQL injection attacks by sanitizing MongoDB queries.


// database
const connectDB = require('./db/connect');

//  routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoute');
const productRouter = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

// For development
app.use(morgan('dev'));

// For production (detailed logs)
app.use(morgan('combined'));


app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static('./public'));
app.use(fileUpload());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRoutes); // Use category routes

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);



const port = process.env.PORT || 5000;
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
