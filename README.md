# Menu Manager

A full-stack hierarchical menu management system designed for restaurants, cafés, and e-commerce platforms. Features a robust Node.js/Express backend with MongoDB and a modern React/Redux frontend for intuitive menu administration.

---

## Overview

Menu Manager provides a three-tier hierarchical structure (Categories → Subcategories → Items) with advanced features including image management via Cloudinary, flexible tax configurations with inheritance, fuzzy search capabilities, and a visual menu tree interface.

**Key Capabilities:**
- Complete CRUD operations for categories, subcategories, and menu items
- Cloudinary integration for image uploads and management
- Smart tax inheritance system with override capabilities
- Advanced search and filtering
- Interactive menu tree visualizer
- Production-ready architecture with centralized error handling

---

## Tech Stack

### Backend (Primary Focus)
- **Runtime:** Node.js (v14+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Image Storage:** Cloudinary
- **Validation:** express-validator
- **File Upload:** Multer
- **Configuration:** dotenv

### Frontend
- **Framework:** React 18 with TypeScript
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **Build Tool:** Vite

---

## Backend Architecture

### Design Patterns & Structure

The backend follows a **layered MVC architecture** with clear separation of concerns:

```
backend/
├── src/
│   ├── config/          # Database & Cloudinary configuration
│   ├── controllers/     # Business logic and request handling
│   ├── models/          # Mongoose schemas and data models
│   ├── routes/          # API endpoint definitions
│   ├── middlewares/     # Error handling & file upload middleware
│   └── utils/           # Validation rules and helpers
├── .env.example         # Environment variables template
├── package.json
└── server.js            # Application entry point
```

**Key Design Principles:**
- **Modular Architecture:** Each entity (Category, SubCategory, Item) has dedicated controller, model, and route files
- **Centralized Error Handling:** Single middleware catches and formats all errors consistently
- **Validation Layer:** express-validator ensures data integrity before processing
- **Async/Await Pattern:** Modern promise-based error handling throughout
- **Database Indexing:** Optimized queries with strategic MongoDB indexes

### Database Schema

#### Category Model
```javascript
{
  name: String (required, unique, max 100 chars),
  image: String (Cloudinary URL),
  description: String (max 500 chars),
  taxApplicability: Boolean (default: false),
  tax: Number (min: 0, required if taxApplicability is true),
  taxType: String (enum: ['percentage', 'fixed'], default: 'percentage'),
  timestamps: true
}
```

**Indexes:** `name` (unique)

#### SubCategory Model
```javascript
{
  name: String (required, max 100 chars),
  image: String (Cloudinary URL),
  description: String (max 500 chars),
  categoryId: ObjectId (required, ref: 'Category'),
  taxApplicability: Boolean (null = inherit from parent),
  tax: Number (min: 0, null = inherit from parent),
  timestamps: true
}
```

**Indexes:** `categoryId`, compound index on `(categoryId, name)`

#### Item Model
```javascript
{
  name: String (required, max 100 chars),
  image: String (Cloudinary URL),
  description: String (max 500 chars),
  taxApplicability: Boolean (required),
  tax: Number (min: 0, required if taxApplicability is true),
  baseAmount: Number (required, min: 0),
  discount: Number (default: 0, min: 0, cannot exceed baseAmount),
  totalAmount: Number (auto-calculated: baseAmount - discount),
  categoryId: ObjectId (ref: 'Category'),
  subCategoryId: ObjectId (ref: 'SubCategory'),
  timestamps: true
}
```

**Business Rules:**
- Item must belong to either a category OR subcategory (not both, not neither)
- Total amount is automatically calculated on save

**Indexes:** `categoryId`, `subCategoryId`, `name`, compound index on `(categoryId, subCategoryId)`

### Authentication & Authorization

Currently, the API is **open** without authentication. For production deployment, consider implementing:
- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting
- Request validation middleware

### API Endpoints

**Base URL:** `http://localhost:5000/api`

#### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Create new category (multipart/form-data) |
| GET | `/categories` | Get all categories |
| GET | `/categories/:id` | Get category by ID |
| GET | `/categories/search/:name` | Search category by name (case-insensitive) |
| PUT | `/categories/:id` | Update category (multipart/form-data) |

#### Subcategories
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/subcategories` | Create new subcategory (multipart/form-data) |
| GET | `/subcategories` | Get all subcategories |
| GET | `/subcategories/:id` | Get subcategory by ID |
| GET | `/subcategories/search/:name` | Search subcategory by name |
| GET | `/subcategories/category/:categoryId` | Get subcategories by parent category |
| PUT | `/subcategories/:id` | Update subcategory (multipart/form-data) |

#### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/items` | Create new item (multipart/form-data) |
| GET | `/items` | Get all items |
| GET | `/items/:id` | Get item by ID |
| GET | `/items/name/:name` | Search item by exact name |
| GET | `/items/category/:categoryId` | Get items by category |
| GET | `/items/subcategory/:subCategoryId` | Get items by subcategory |
| GET | `/search/items?name=query` | Fuzzy search items |
| PUT | `/items/:id` | Update item (multipart/form-data) |

#### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

### Tax Inheritance Flow

The system implements intelligent tax inheritance:

1. **Category Level:** Define tax applicability, rate, and type
2. **Subcategory Level:** Inherits from parent category by default; can override with custom values
3. **Item Level:** Must explicitly set tax values (can inherit logic handled by frontend)

### Key Dependencies

| Package | Purpose |
|---------|---------|
| express | Web framework for API routing and middleware |
| mongoose | MongoDB ODM for schema definition and queries |
| cloudinary | Cloud-based image storage and transformation |
| multer | Multipart form data handling for file uploads |
| express-validator | Request validation and sanitization |
| cors | Cross-origin resource sharing configuration |
| dotenv | Environment variable management |

### Error Handling

Centralized error handler (`src/middlewares/errorHandler.js`) provides:
- Consistent error response format
- Mongoose error translation (CastError, ValidationError, duplicate keys)
- Multer file upload error handling
- Development vs production error details
- Proper HTTP status codes

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Stack trace (development only)"
}
```

### Environment Variables

Required configuration in `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/menu-management

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Frontend Overview

### Architecture

The frontend uses a **Redux Toolkit** state management pattern with feature-based slices:

```
frontend/
├── api/                 # Axios instance and service layer
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── visualizers/    # Menu tree visualizer
├── pages/              # Route-level components
├── store/              # Redux slices and store configuration
├── hooks/              # Custom React hooks
├── utils/              # Helper functions (tree transformation)
└── types.ts            # TypeScript type definitions
```

### Key Features

- **Interactive Menu Tree:** Collapsible hierarchical view with color-coded nodes and count badges
- **Smart Forms:** React Hook Form integration with validation
- **Real-time Feedback:** Toast notifications for all operations
- **Responsive Design:** Mobile-first Tailwind CSS styling
- **Type Safety:** Full TypeScript implementation

### Frontend-Backend Connection

The frontend connects to the backend via Axios with a centralized instance configured in `api/axiosInstance.ts`. The base URL is set via environment variable:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Service layer files (`categoryService.ts`, `subcategoryService.ts`, `itemService.ts`) abstract API calls, providing clean interfaces for Redux thunks.

---

## Prerequisites

- **Node.js** v14 or higher
- **MongoDB** v4.4+ (local installation or MongoDB Atlas account)
- **Cloudinary Account** (free tier available at [cloudinary.com](https://cloudinary.com))
- **npm** or **yarn** package manager

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd menu-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:

```bash
cp .env.example .env
```

Configure your `.env` file with actual credentials:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/menu-management
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**MongoDB Setup:**
- **Local:** Ensure MongoDB is running (`mongod`)
- **Atlas:** Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and use the connection string

**Cloudinary Setup:**
- Sign up at [Cloudinary](https://cloudinary.com/)
- Navigate to Dashboard to find your Cloud Name, API Key, and API Secret

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Running the Application

### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm run dev
```
Application runs on `http://localhost:5173` (or next available port)

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## Example API Usage

### Create a Category

```bash
curl -X POST http://localhost:5000/api/categories \
  -F "name=Beverages" \
  -F "description=Hot and cold drinks" \
  -F "taxApplicability=true" \
  -F "tax=5" \
  -F "taxType=percentage" \
  -F "image=@/path/to/image.jpg"
```

### Create a Subcategory

```bash
curl -X POST http://localhost:5000/api/subcategories \
  -F "name=Coffee" \
  -F "categoryId=<category_id>" \
  -F "description=Various coffee drinks" \
  -F "image=@/path/to/image.jpg"
```

### Create an Item

```bash
curl -X POST http://localhost:5000/api/items \
  -F "name=Cappuccino" \
  -F "description=Espresso with steamed milk" \
  -F "baseAmount=4.50" \
  -F "discount=0.50" \
  -F "taxApplicability=true" \
  -F "tax=5" \
  -F "subCategoryId=<subcategory_id>" \
  -F "image=@/path/to/image.jpg"
```

### Search Items

```bash
curl "http://localhost:5000/api/search/items?name=coffee"
```

---

## Project Structure

```
menu-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── category.controller.js
│   │   │   ├── subcategory.controller.js
│   │   │   └── item.controller.js
│   │   ├── models/
│   │   │   ├── category.model.js
│   │   │   ├── subcategory.model.js
│   │   │   └── item.model.js
│   │   ├── routes/
│   │   │   ├── category.routes.js
│   │   │   ├── subcategory.routes.js
│   │   │   └── item.routes.js
│   │   ├── middlewares/
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   └── utils/
│   │       └── validators.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── README.md
│   └── server.js
│
└── frontend/
    ├── api/
    │   ├── axiosInstance.ts
    │   ├── categoryService.ts
    │   ├── subcategoryService.ts
    │   └── itemService.ts
    ├── components/
    │   ├── common/
    │   ├── forms/
    │   ├── layout/
    │   └── visualizers/
    ├── pages/
    │   ├── CategoriesPage.tsx
    │   ├── SubcategoriesPage.tsx
    │   ├── ItemsPage.tsx
    │   ├── MenuTreePage.tsx
    │   └── SearchPage.tsx
    ├── store/
    │   ├── categoriesSlice.ts
    │   ├── subcategoriesSlice.ts
    │   ├── itemsSlice.ts
    │   ├── uiSlice.ts
    │   └── index.ts
    ├── hooks/
    ├── utils/
    ├── .env
    ├── .gitignore
    ├── package.json
    ├── README.md
    ├── tsconfig.json
    ├── vite.config.ts
    ├── App.tsx
    └── index.tsx
```

---

## License

This project is licensed under the MIT License.

---

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
