# **Course Selling App Backend**

A robust and scalable backend for the **Course Selling App**, built using **Node.js**, **Express.js**, and **MongoDB**. This application includes admin/user authentication, course management, secure purchases, and image uploads via Cloudinary.

---

## **Table of Contents**

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)

---

## <a id="features"></a>**🚀Features**

### 🔐 Admin Authentication

- Sign up, log in, and log out
- Secured with JWT and bcrypt

### 📦 Course Management

- Admin can create, update, and delete courses
- Courses support image uploads via Cloudinary
- Input validation using Zod schemas

### 💳 Course Purchase

- Users can buy courses
- Tracks purchase history per user

---

## <a id="tech-stack"></a>**🛠 Tech Stack**

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, bcrypt
- **Validation:** Zod
- **Image Upload:** Cloudinary

---

## <a id="installation"></a>**🧰 Installation**

### **Clone the repository**

```bash
git clone https://github.com/VinayPrabhakarX/course-selling-app.git
cd course-selling-app
```

### **Install dependencies**

```bash
npm install
```

---

## <a id="environment-variables"></a>**🔐 Environment Variables**

Rename the .ENV.EXAMPLE file to .env and configure the variables as shown:

```env
PORT=3000                        # Port to run the server
MONGO_URI=your_mongodb_uri       # MongoDB connection URI
CLOUD_NAME=your_cloudinary_name  # Cloudinary cloud name
API_KEY=your_cloudinary_api_key  # Cloudinary API key
JWT_USER_PASSWORD=your_user_jwt_secret
JWT_ADMIN_PASSWORD=your_admin_jwt_secret
NODE_ENV=development              # or production
```

---

## <a id="running-the-server"></a>**📡 Running the Server**

To start the server:

```bash
npm start
```

The server will run at:
http://localhost:3000

---

## <a id="api-endpoints"></a>**📨 API Endpoints**

### **Admin Routes**

| Method | Endpoint               | Description  |
| ------ | ---------------------- | ------------ |
| POST   | `/api/v1/admin/signup` | Admin signup |
| POST   | `/api/v1/admin/login`  | Admin login  |
| GET    | `/api/v1/admin/logout` | Admin logout |

### **User Routes**

| Method | Endpoint                       | Description                |
| ------ | ------------------------------ | -------------------------- |
| POST   | `/api/v1/user/signup`          | User signup                |
| POST   | `/api/v1/user/login`           | User login                 |
| POST   | `/api/v1/user/logout`          | User logout                |
| POST   | `/api/v1/course/buy/:courseId` | Purchase a course          |
| GET    | `/api/v1/user/purchases`       | List all purchased courses |

### **Course Routes**

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| POST   | `/api/v1/course/create`     | Create a new course       |
| PUT    | `/api/v1/courses/:courseId` | Update an existing course |
| DELETE | `/api/v1/courses/:courseId` | Delete a course           |
| GET    | `/api/v1/courses`           | Get all courses           |
| GET    | `/api/v1/courses/:courseId` | Get a specific course     |

---

## <a id="project-structure"></a>**📁 Project Structure**

```
/course-selling-app
├── /controllers
│   ├── admin.controller.js       # Admin logic
│   ├── course.controller.js      # Course logic
│   └── user.controller.js        # User logic
├── /middleware
│   ├── admin.mid.js              # Admin authentication middleware
│   └── user.mid.js               # User authentication middleware
├── /models
│   ├── admin.model.js            # Admin schema
│   ├── course.model.js           # Course schema
│   ├── purchase.model.js         # Purchase schema
│   └── usermodel.js              # User schema
├── /routes
│   ├── admin.route.js            # Admin routes
│   ├── course.route.js           # Course routes
│   └── user.route.js             # User routes
├── config.js                     # App configuration
├── .env                          # Environment variables
├── .gitignore                    # Files to ignore in Git
├── index.js                      # App entry point
└── README.md                     # Project documentation
```