# 🍽️ Menu Manager – Backend API

A structured and scalable backend solution for managing categories, subcategories, and items — built with **Node.js**, **Express**, **MongoDB**, and **Cloudinary**.

---

## 🚀 Overview

This API provides a **three-tier hierarchical menu system** with image uploads, tax configurations, and advanced querying. It’s designed for restaurants, cafés, and e-commerce platforms looking for efficient menu management.

---

## ✨ Key Features

* **3-Level Hierarchy** → Categories → Subcategories → Items
* **Cloudinary Integration** → Easy image upload and management
* **Flexible Tax Handling** → Tax inheritance from parent entities
* **Fuzzy Search & Filtering** → Find items quickly
* **Robust Validation** → Powered by `express-validator`
* **Centralized Error Handling** → Clear and structured error responses
* **Optimized MongoDB Indexing** → Faster queries
* **Production-Ready Codebase** → Clean, modular, and maintainable

---

## 🧩 Tech Stack

| Category          | Technology         |
| ----------------- | ------------------ |
| Runtime           | Node.js            |
| Framework         | Express.js         |
| Database          | MongoDB + Mongoose |
| Image Storage     | Cloudinary         |
| Validation        | express-validator  |
| File Upload       | Multer             |
| Config Management | dotenv             |

---

## ⚙️ Prerequisites

Make sure you have:

* Node.js v14+
* MongoDB v4.4+ (local or Atlas)
* Cloudinary account
* npm or yarn

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example file and add your credentials:

```bash
cp .env.example .env
```

**Example `.env`:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/menu-management
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Setup MongoDB

**Local:**

```bash
mongod
```

**Atlas (Cloud):**

* Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
* Replace `MONGODB_URI` with your connection string

### 5. Configure Cloudinary

* Sign up at [Cloudinary](https://cloudinary.com/)
* Add Cloud Name, API Key, and Secret to `.env`

---

## ▶️ Running the Application

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

Server runs on:
👉 `http://localhost:5000` (default)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database & Cloudinary setup
│   ├── controllers/     # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Error handling & file uploads
│   └── utils/           # Validation helpers
├── .env.example
├── package.json
├── README.md
└── server.js
```

---

## 📚 API Overview

**Base URL:**

```
http://localhost:5000/api
```

### Category Endpoints

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| POST   | `/categories`              | Create category         |
| GET    | `/categories`              | Get all categories      |
| GET    | `/categories/:id`          | Get category by ID      |
| GET    | `/categories/search/:name` | Search category by name |
| PUT    | `/categories/:id`          | Update category         |

### SubCategory Endpoints

| Method | Endpoint                              | Description                   |
| ------ | ------------------------------------- | ----------------------------- |
| POST   | `/subcategories`                      | Create subcategory            |
| GET    | `/subcategories`                      | Get all subcategories         |
| GET    | `/subcategories/:id`                  | Get subcategory by ID         |
| GET    | `/subcategories/search/:name`         | Search subcategory by name    |
| GET    | `/subcategories/category/:categoryId` | Get subcategories by category |
| PUT    | `/subcategories/:id`                  | Update subcategory            |

### Item Endpoints

| Method | Endpoint                            | Description              |
| ------ | ----------------------------------- | ------------------------ |
| POST   | `/items`                            | Create item              |
| GET    | `/items`                            | Get all items            |
| GET    | `/items/:id`                        | Get item by ID           |
| GET    | `/items/name/:name`                 | Search item by name      |
| GET    | `/items/category/:categoryId`       | Get items by category    |
| GET    | `/items/subcategory/:subCategoryId` | Get items by subcategory |
| GET    | `/search/items?name=`               | Fuzzy search items       |
| PUT    | `/items/:id`                        | Update item              |

---

## 🧠 Example Requests

**Create Category:**

```bash
curl -X POST http://localhost:5000/api/categories \
  -F "name=Beverages" \
  -F "description=Hot and cold drinks" \
  -F "taxApplicability=true" \
  -F "tax=5" \
  -F "taxType=percentage" \
  -F "image=@/path/to/image.jpg"
```

**Search Items:**

```bash
curl "http://localhost:5000/api/search/items?name=coffee"
```

---

## 🗃️ Database Schemas

### Category

```js
{
  name: String,
  image: String,
  description: String,
  taxApplicability: Boolean,
  tax: Number,
  taxType: String, // "percentage" or "fixed"
}
```

### SubCategory

```js
{
  name: String,
  categoryId: ObjectId, // ref: Category
  image: String,
  description: String,
  taxApplicability: Boolean,
  tax: Number,
}
```

### Item

```js
{
  name: String,
  image: String,
  description: String,
  baseAmount: Number,
  discount: Number,
  totalAmount: Number,
  taxApplicability: Boolean,
  tax: Number,
  categoryId: ObjectId, // ref: Category
  subCategoryId: ObjectId, // ref: SubCategory
}
```

> **Note:** An item must belong to either a category or a subcategory, not both.

---

## ⭐ Support

If you find this project helpful, please give it a ⭐ on GitHub!
