# E-Commerce REST API

A fully functional E-Commerce REST API built with Node.js, Express, and MongoDB.  
It includes authentication, role-based access control, product management, cart system, order processing, coupon handling, and product reviews.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access (Admin / User)

- **Product Management**
  - Create, read, update, delete products (Admin only for modifications)
  - Pagination & filtering support

- **Cart System**
  - Add, modify quantity, remove, and clear items
  - Apply discount coupons before checkout

- **Order Management**
  - Create orders from cart
  - View order details & history
  - Admin can see all orders and update states

- **Coupons**
  - Admin can create discount coupons
  - Validates expiration & max uses

- **Reviews**
  - Users can review only purchased products
  - Users can see product's reviews and reviews made by an user

## Tech Stack

- **Node.js** – Runtime environment
- **Express.js** – Web framework
- **MongoDB + Mongoose** – Database
- **bcrypt** – Password hashing
- **jsonwebtoken** – Authentication
- **express-validator** – Request validation
- **dotenv** – Environment variables

## Project Structure
- Config
- Controllers
- Middlewares
- Models
- Node_modules
- Routes
- Utils
- server.js
- .env (ignored)

## How to Run Locally

1. **Clone the repository:**
    ```bash
    git clone https://github.com/maximo-ale/task-managment-api---
    cd your-repo-name

2. **Install dependencies:**
    npm install

3. **Set environment variables:**
Create a .env file with the following:
MONGODB_URI=<your_mongo_uri>
JWT_SECRET=<your_secret_key>
PORT=3000

4. **Run the server:**
    npm run dev

# API Endpoints

## **Auth**
| Method | Endpoint       | Description |
|--------|---------------|-------------|
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login user |

## **Products**
| Method | Endpoint             | Description |
|--------|----------------------|-------------|
| POST   | `/api/products/create` | Create product (Admin) |
| GET    | `/api/products/find`   | Get all products (with pagination & filters) |
| GET    | `/api/products/find/:id` | Get product by ID |
| PUT    | `/api/products/modify/:id` | Modify product (Admin) |
| DELETE | `/api/products/delete/:id` | Delete product (Admin) |

## **Cart**
| Method | Endpoint                     | Description |
|--------|------------------------------|-------------|
| GET    | `/api/cart/`                  | Get user cart |
| POST   | `/api/cart/add`               | Add product to cart |
| PUT    | `/api/cart/modifyQuantity/:productId` | Modify product quantity in cart |
| DELETE | `/api/cart/removeProduct/:productId` | Remove product from cart |
| DELETE | `/api/cart/clear`             | Clear cart |
| POST   | `/api/cart/addCoupon`         | Apply coupon to cart |

## **Orders**
| Method | Endpoint                     | Description |
|--------|------------------------------|-------------|
| POST   | `/api/order/create`           | Create order from cart |
| GET    | `/api/order/details/:orderId` | Get order details |
| GET    | `/api/order/history`          | Get user order history |
| GET    | `/api/order/all`              | Get all orders (Admin) |
| PUT    | `/api/order/state/:orderId`   | Update order state (Admin) |

## **Coupons**
| Method | Endpoint             | Description |
|--------|----------------------|-------------|
| POST   | `/api/coupon/create` | Create coupon (Admin) |
| GET    | `/api/coupon/`       | Get all coupons |

## **Reviews**
| Method | Endpoint                      | Description |
|--------|--------------------------------|-------------|
| POST   | `/api/review/create/:productId` | Create review for purchased product |
| PUT    | `/api/review/modify/:productId` | Modify own review |
| GET    | `/api/review/:productId`        | Get reviews for a product |
| GET    | `/api/review/userReviews/:userId` | Get all reviews by user |
| DELETE | `/api/review/delete/:reviewId` | Delete review |

## Author
Developed by Máximo Ale.
Contact: maximoale20000@gmail.com