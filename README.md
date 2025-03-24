# 🛒 E-Commerce API with Stripe Payment Gateway

## 📌 Overview
This project is a fully functional **E-Commerce API** built with **Node.js and Express**, featuring **user authentication, product management, order processing, and Stripe payment integration**.

## 🚀 Features
- **User Authentication**: Register, login, and manage user accounts securely.
- **Product Management**: Fetch and manage product listings.
- **Shopping Cart**: Add, update, and remove items from the cart.
- **Order Processing**: Create and track orders.
- **Payment Gateway**: Secure payments using **Stripe**.
- **Shipping Integration**: Handle shipping details with seamless order fulfillment.

## 🏗️ Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose ORM)
- **Authentication**: JSON Web Token (JWT)
- **Payment Processing**: Stripe API
- **Environment Management**: dotenv

## 📂 Installation
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/igwemiracle/miracle-store-backend.git
cd mira-store-backend
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory and configure the following:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 4️⃣ Run the Server
```sh
npm start
```
The API will be available at `http://localhost:5000`

## 🔗 API Endpoints

### 🔑 Authentication
| Method | Endpoint        | Description            |
|--------|---------------|------------------------|
| POST   | /api/v1/auth/register | Register a new user   |
| POST   | /api/v1/auth/login | Login and get a token |

### 🛍️ Products
| Method | Endpoint        | Description              |
|--------|---------------|--------------------------|
| GET    | /api/v1/products  | Get all products         |
| GET    | /api/v1/products/:id | Get a single product  |

### 🛒 Cart
| Method | Endpoint        | Description              |
|--------|---------------|--------------------------|
| POST   | /api/v1/cart/add  | Add item to cart        |
| DELETE | /api/v1/cart/:id  | Remove item from cart   |

### 🛍️ Orders
| Method | Endpoint        | Description              |
|--------|---------------|--------------------------|
| POST   | /api/v1/orders/create  | Create an order     |
| GET    | /api/v1/orders/:id | Get order details      |

### 💳 Payments (Stripe)
| Method | Endpoint        | Description              |
|--------|---------------|--------------------------|
| POST   | /api/v1/payments/ | Process payment via Stripe |

## 📧 Contact
If you have any questions, feel free to reach out!

💻 **Developer:** Miracle
📧 Email: igwemiracle35@gmail.com
📍 GitHub: [igwemiracle](https://github.com/yourusername)

---
💙 _If you find this project useful, consider giving it a ⭐️!_

