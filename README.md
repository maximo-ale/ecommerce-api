# E-Commerce REST API

A fully functional E-Commerce REST API built with Node.js, Express, and MongoDB.
It includes authentication, role-based access control, product management, cart system, order processing, coupon handling, product reviews, request limiting, error handling, clustering for scalability, and automated testing.

## Quick Start

1. Clone the repository
- git clone https://github.com/maximo-ale/ecommerce-api.git
- cd ecommerce-api

2. Install dependencies
- npm install

3. Copy '.env.example' to '.env'
- On Windows CMD:
copy .env.example .env
- On Windows PowerShell:
Copy-Item .env.example .env
- On Linux/macOS:
cp .env.example .env

4. The '.env' file already includes a test user and a public database:
- PORT=3000
- MONGO_URI=mongodb+srv://testUser:testPassword@cluster.uzqisyr.mongodb.net/?
- JWT_SECRET=JWT_example

4. Start the server
- npm start

## Database Reset for Demo

This project includes a script to reset the database and load test data automatically when the server starts with:

RESET_DB_ON_START=true

Notes:

Only for demo/testing purposes.

It is disabled by default (RESET_DB_ON_START=false) in production to preserve real data.

This ensures each recruiter or tester starts with a clean environment.

## Features

### Authentication & Authorization
- JWT-based authentication  
- Role-based access (Admin / User)  

### Product Management
- Create, read, update, delete products
- Pagination & filtering support  

### Cart System
- Add, modify quantity, remove, and clear items  
- Apply discount coupons before checkout  

### Order Management
- Create orders from cart  
- View order details & history  
- Admin can see all orders and update states  

### Coupons
- Admin can create discount coupons  
- Validates expiration & max uses  

### Reviews
- Users can review only purchased products  
- Users can see product's reviews and reviews made by a user  

### Security & Performance
- Request rate limiting (`express-rate-limit`)  
- Global error handler  
- Clustering support for better scalability  

### Testing
- Jest + Supertest integration  
- Automated tests for main endpoints
- To run tests locally: `npm test -- --runInBand`

## Technologies
- Node.js  
- Express  
- MongoDB + Mongoose  
- JWT for authentication  
- express-validator  
- bcrypt (password hashing)  
- express-rate-limit (request limiting)  
- Jest + Supertest (testing)  
- Postman (manual testing)  

## Project Structure
- /config --> DB connection
- /entities --> Each entity has its own folder containing:
    - Model
    - Controller
    - Repository
    - Routes
    - Service
- /middlewares
- /tests (Jest and Supertest)
- /utils --> General helper functions and utilities
- 'cluster.js'
- 'server.js'
- .env (ignored)

# API Endpoints

## **Auth**
| Method | Endpoint       | Description |
|--------|---------------|-------------|
| POST   | /api/auth/register | Register a new user |
| POST   | /api/auth/login    | Login user |

## **Products**
| Method | Endpoint             | Description |
|--------|----------------------|-------------|
| POST   | /api/products/create | Create product (Admin) |
| GET    | /api/products/find   | Get all products (with pagination & filters) |
| GET    | /api/products/find/:id | Get product by ID |
| PATCH  | /api/products/modify/:id | Modify product (Admin) |
| PATCH  | /api/products/delete/:id | Delete product (Admin) |

## **Cart**
| Method | Endpoint                     | Description |
|--------|------------------------------|-------------|
| GET    | /api/cart/                  | Get user cart |
| POST   | /api/cart/add               | Add product to cart |
| PATCH  | /api/cart/modifyQuantity/:productId | Modify product quantity in cart |
| DELETE | /api/cart/removeProduct/:productId | Remove product from cart |
| DELETE | /api/cart/clear             | Clear cart |
| POST   | /api/cart/addCoupon         | Apply coupon to cart |

## **Orders**
| Method | Endpoint                     | Description |
|--------|------------------------------|-------------|
| POST   | /api/order/create           | Create order from cart |
| GET    | /api/order/details/:orderId | Get order details |
| GET    | /api/order/history          | Get user order history |
| GET    | /api/order/all              | Get all orders (Admin) |
| PATCH    | /api/order/state/:orderId   | Update order state (Admin) |

## **Coupons**
| Method | Endpoint             | Description |
|--------|----------------------|-------------|
| POST   | /api/coupon/create | Create coupon (Admin) |
| GET    | /api/coupon/       | Get all coupons |

## **Reviews**
| Method | Endpoint                      | Description |
|--------|--------------------------------|-------------|
| POST   | /api/review/create/:productId | Create review for purchased product |
| PATCH  | /api/review/modify/:productId | Modify own review |
| GET    | /api/review/:productId        | Get reviews for a product |
| GET    | /api/review/userReviews/:userId | Get all reviews by user |
| DELETE | /api/review/delete/:reviewId | Delete review |

## Author
Developed by Máximo Ale.
Contact: maximoale20000@gmail.com