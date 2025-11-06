  

# MenuMaster: Restaurant Menu Management Dashboard


  

**MenuMaster** is a modern, production-ready admin dashboard for managing complex restaurant menu hierarchies. Built with React, Redux Toolkit, and Tailwind CSS, it provides a seamless and intuitive experience for managing Categories, Subcategories, and Items, complete with a powerful interactive menu tree visualizer.

  

---

  

## ✨ Core Features

  

-   **Full CRUD Operations**: Effortlessly create, read, update, and delete Categories, Subcategories, and menu Items.

-   **Interactive Menu Tree Visualizer**: A collapsible, color-coded tree diagram showing the entire menu hierarchy at a glance. Includes count badges and a slide-in detail panel for quick edits.

-   **Smart Tax Inheritance**: Subcategories and items automatically inherit tax settings from their parent, with a clear UI to show inherited values and an option to set custom overrides.

-   **Hierarchical Data Management**: Items can be assigned directly to a Category or nested within a Subcategory, providing flexible menu structures.

-   **Advanced Filtering**: Easily filter subcategories and items by their parent category to quickly navigate your menu.

-   **Image Uploads with Previews**: A user-friendly image uploader with instant previews for all menu entities.

-   **Modern & Responsive UI**: A clean, mobile-first design that works beautifully on all screen sizes, built with Tailwind CSS.

-   **Real-time Feedback**: Integrated toast notifications for success and error states using React Hot Toast.

  

---

  

## 🛠️ Tech Stack & Architecture

  

This project uses a modern frontend stack focused on performance, scalability, and developer experience.

  

| Category         | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Framework        | [React 18](https://reactjs.org/)                |
| State Management | [Redux Toolkit](https://redux-toolkit.js.org/)  |
| Routing          | [React Router v6](https://reactrouter.com/)     |
| HTTP Client      | [Axios](https://axios-http.com/)                |
| Styling          | [Tailwind CSS](https://tailwindcss.com/)        |
| Icons            | [Lucide React](https://lucide.dev/)             |
| Notifications    | [React Hot Toast](https://react-hot-toast.com/) |


  

### Project Structure

  

The codebase is organized into a modular and scalable structure:

  

```

src/

├── api/              # API service layer (Axios config + endpoints)

├── components/       # Reusable UI components (common, forms, layout, etc.)

├── pages/            # Top-level route components

├── store/            # Redux Toolkit slices and store configuration

├── hooks/            # Custom hooks (e.g., useToast)

├── utils/            # Helper functions (e.g., tree transformation)

├── types/            # TypeScript type definitions (if applicable)

└── App.jsx           # Main application component with routing setup

```

  

---

  

## 🚀 Getting Started

  

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

  

### Prerequisites

  

-   [Node.js](https://nodejs.org/) (v16 or higher)

-   `npm` or `yarn` package manager

-   A running instance of the [MenuMaster Backend API](https://github.com/your-repo/menumaster-backend) (link to your backend repo).

  

### Installation & Setup

  

1.  **Clone the Repository**

    ```bash

    git clone https://github.com/your-repo/menumaster-frontend.git

    cd menumaster-frontend

    ```

  

2.  **Install Dependencies**

    ```bash

    npm install

    ```

  

3.  **Set Up Environment Variables**

    The frontend needs to know the URL of the backend API.

    -   Create a new file named `.env` in the root of the project.

    -   Copy the contents of `.env.example` (if it exists) or add the following line:

        ```env

        REACT_APP_API_BASE_URL=http://localhost:5000/api

        ```

    -   *Make sure this URL matches the address where your backend server is running.*

  

4.  **Run the Development Server**

    ```bash

    npm start

    ```

    The application will be available at `http://localhost:3000` (or another port if 3000 is in use).

  

---

  

## 🔧 Key Implementation Details

  

### State Management (Redux Toolkit)

  

-   **Slice-based Architecture**: State is organized into feature-based "slices" (`categoriesSlice`, `itemsSlice`, `uiSlice`, etc.), making the logic modular and easy to maintain.

-   **Async Operations**: `createAsyncThunk` is used to handle all API calls, which automatically dispatches pending, fulfilled, and rejected actions to manage loading and error states.

-   **UI State**: A dedicated `uiSlice` manages the state of all modals and side panels, decoupling UI logic from data logic.

  

### API Layer (Axios)

  

-   A centralized Axios instance (`api/axiosInstance.js`) is configured with the base URL, simplifying API calls across the application.

-   Services (`api/categoryService.js`, etc.) abstract the API endpoints, providing a clean interface for Redux thunks to interact with the backend. All data fetching logic is kept out of the components.

  

### Menu Tree Transformation

  

-   The backend provides data as flat arrays (categories, subcategories, items). The `utils/treeTransform.js` utility contains the `buildMenuTree` function, which efficiently processes these arrays and builds a nested, hierarchical tree structure required for the `TreeNode` visualizer component. This logic is decoupled from the component, making it pure and testable.

  

---

  

## 🤝 Contributing

  

Contributions are welcome! Please feel free to submit a Pull Request.

  

1.  Fork the repository.

2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).

3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).

4.  Push to the branch (`git push origin feature/AmazingFeature`).

5.  Open a Pull Request.

  

---

  

## 📄 License

  

This project is licensed under the MIT License.