## 1. Introduction

Vruksha is a full‑stack web application that turns **plant care into a gamified experience**.  
Users can buy plants from a virtual nursery, regularly upload growth photos, and earn points, rewards, and coupons based on **real, measurable growth** of their plants.

The system combines:
- **E‑commerce** for plant purchase
- **Computer vision** and image analysis for growth tracking
- **Reward mechanics** (points, coupons, leaderboard)
- A **personal dashboard** to monitor progress and history

---

## 2. Problem Statement

Modern lifestyles make it hard for people to:
- Consistently care for plants and stay motivated over time
- See objective feedback about how well their plants are growing
- Feel rewarded for sustainable, eco‑friendly habits

There is a gap between **one‑time enthusiasm** (buying plants) and **long‑term engagement** (daily care).  
We need a system that:
- Encourages **regular plant care**
- Provides **visual + quantitative feedback** on growth
- Rewards users for **sustainable behaviour** in a fun and social way

---

## 3. Objectives

- **Engagement**: Motivate users to care for their plants regularly using streaks, rewards, and gamification.
- **Measurement**: Objectively estimate plant growth using **image comparison** and color/size analysis.
- **Rewards**: Convert growth points into **discount coupons** and leaderboard rankings.
- **User Experience**: Provide a simple, mobile‑responsive interface for:
  - Browsing and buying plants
  - Uploading plant photos
  - Viewing rewards, orders, and progress
- **Security**: Implement secure **authentication**, **authorization**, and safe handling of user data and images.

---

## 4. Literature Survey

The system concept is inspired by:
- **Gamification in sustainability apps**  
  Many successful apps (fitness trackers, learning platforms) use points, streaks, and leaderboards to drive behaviour.  
  Vruksha adopts similar mechanics for **plant care** and environmental consciousness.

- **Computer vision for growth analysis**  
  Image processing techniques (size comparison, color/HSV analysis, pixel‑level difference) are commonly used for:
  - Agricultural monitoring
  - Disease detection
  - Yield estimation  
  Vruksha uses a simplified version of these ideas to:
  - Compare new plant photos with previous uploads
  - Estimate size and green‑area changes
  - Detect suspicious / non‑genuine uploads

- **Reward‑based engagement systems**  
  Loyalty programs and coupon systems are widely used in e‑commerce.  
  Here, **points** from plant growth are converted into **coupons**, closing the loop between care, rewards, and future purchases.

---

## 5. System Requirements

### 5.1 Functional Requirements

- **User Management**
  - User registration with profile details and avatar
  - Login / logout with secure JWT‑based authentication (cookies)
  - View and update account details

- **Plant & Shop**
  - Browse available plants with filters (type, difficulty, price, max points)
  - View detailed plant information and potential points
  - Add plant to checkout and complete purchase

- **Growth Tracking**
  - Upload regular plant photos with basic location verification
  - Validate images (format and authenticity heuristics)
  - Compare new uploads with previous ones and compute **growth points**

- **Rewards**
  - Maintain total and available points per user
  - Provide a reward **catalog** and allow point‑based coupon claims
  - Validate coupon codes and apply them at checkout
  - Show a **Leaderboard** based on streaks/points (demo data)

- **Orders & Payments**
  - Create and store order records
  - Integrate **Razorpay** for online payment
  - Support **Cash on Delivery (COD)** flow
  - Show order history in **My Orders**

### 5.2 Non‑Functional Requirements

- **Performance**: Image processing and comparison should complete in acceptable time for typical photo sizes.
- **Security**: Password hashing, JWT authentication, HTTP‑only cookies, validation of requests.
- **Scalability**: Separate backend API and frontend SPA allow horizontal scaling.
- **Usability**: Mobile‑responsive UI with clear navigation (Navbar, Dashboard, Shop, etc.).
- **Reliability**: Robust error handling for uploads, payments, and network failures.

### 5.3 Software / Hardware Requirements

- **Frontend**
  - React + Vite
  - Tailwind CSS
  - Axios / Fetch API
  - React Router

- **Backend**
  - Node.js + Express (ES modules)
  - MongoDB + Mongoose
  - JWT for auth
  - Multer for file uploads
  - Image utilities (Sharp, OpenCV‑based helpers, custom validation/comparison)
  - Razorpay SDK

- **Development Environment**
  - Node.js (recommended LTS, e.g., v20)
  - npm
  - Modern browser (Chrome/Edge/Firefox)
  - MongoDB instance (local or cloud)

---

## 6. Methodology

Vruksha follows a **modular, API‑driven architecture**:

1. **User Registration & Authentication**
   - Users sign up with basic details and avatar upload.
   - Backend validates inputs, hashes passwords, and stores user data.
   - On login, backend issues **access** and **refresh tokens**, stored in HTTP‑only cookies.

2. **Plant Purchase Flow**
   - Users browse plants in the **Shop** and view details on the **Plant Detail** page.
   - On “Buy”:
     - User is redirected to **Signin** if not authenticated.
     - Authenticated users proceed to **Checkout**.
   - Checkout supports:
     - Coupon validation (reward points → discount)
     - Online payment via Razorpay (create order + verify)
     - COD with locally generated payment IDs
   - On success, an **order record** is created and shown on **My Orders**.

3. **Image Upload & Growth Analysis**
   - From the **Dashboard**, users open an upload popup and:
     - Select an image
     - Provide plant name
     - Allow location access (for basic authenticity check)
   - Backend pipeline:
     - Validate the image (format, heuristic authenticity scoring)
     - Extract plant parameters (size, green area, etc.)
     - Fetch previous upload (if any) and run **compareImages** to get:
       - Height/width changes
       - Green area change
     - Compute **growth points** based on these differences, with safeguards against extreme/suspicious changes.
     - Save upload record and update user rewards.

4. **Rewards & Leaderboard**
   - `rewards/summary` endpoint aggregates:
     - Total points
     - Available (unspent) points
     - Claimed coupons
   - Users can claim coupons from a **catalog** if they have enough points.
   - Coupons can be applied at checkout and validated via `rewards/validate`.
   - Leaderboard page displays sample data to illustrate ranking by streaks and points.

5. **Frontend Experience**
   - Single‑page React app with:
     - **Protected routes** (Dashboard, Checkout, Orders) using a simple auth guard.
     - **Navbar** with profile menu and logout.
     - Responsive design for mobile/desktop using Tailwind.

---

## 7. Implementation

### 7.1 Backend (Express + MongoDB)

- **Key Modules**
  - `user.controller.js`: registration, login, logout, password change/reset, profile update, current user, upload controller.
  - `auth.middleware.js`: verifies JWT tokens from cookies/headers and attaches user to `req`.
  - `order.controller.js`: order creation and retrieval.
  - `reward.controller.js`: reward summary, coupon claiming, coupon validation.
  - `payment.controller.js`: Razorpay order creation and payment verification.
  - `plant.controller.js`: provides plant data for the shop (if using backend plants).

- **Utilities**
  - `Validateimage.js`: heuristic authenticity checks (variance, ranges, thresholds).
  - `extractParams.js` / `compareimages.js`: extract plant parameters and compare previous vs current upload.
  - `growth scoring` helper: converts comparison metrics to a 0–10 point scale.
  - `ApiError`, `ApiResponse`, and `asyncHandler`: standardized error/response handling.

- **Routes**
  - `/api/v1/users/login`, `/register`, `/logout`, `/current-user`, `/update-account`, `/change-password`, `/reset-password`, `/contact`
  - `/api/v1/users/upload-plant`, `/orders`, `/payments/create-order`, `/payments/verify`
  - `/api/v1/users/rewards/summary`, `/rewards/claim`, `/rewards/validate`

### 7.2 Frontend (React + Tailwind)

- **Pages**
  - `Home`: Hero, featured plants, overview of features.
  - `Shop`: Plant listing with **FilterBar**.
  - `Plant`: Detailed plant page with price, image, and potential points.
  - `Dashboard`: Rewards summary, coupons, recent uploads, and upload button.
  - `Checkout`: Billing + payment form, coupon application, and Razorpay integration.
  - `MyOrders`: List of past orders with payment and delivery details.
  - `Leaderboard`: Visual leaderboard of top players.
  - `SignIn` / `Signup`: Authentication screens.
  - `SuccessPage`: Payment success summary.

- **Components**
  - `Navbar`, `Footer`
  - `Hero`, `FeaturedPlants`, `PlantCard`
  - `FilterBar` (interactive dropdown filters)
  - `UploadPopup` (image upload + rules + preview)

- **Auth Handling**
  - `localStorage.isAuthenticated` used to track client auth state.
  - `RequireAuth` wrapper in `App.jsx` protects sensitive routes.
  - Navbar controls show **Signin/Signup** when logged out, and **Profile/Logout** when logged in.

---

## 8. Results and Discussion

### 8.1 Results

- Users can:
  - Register, log in, and manage profile data securely.
  - Browse and purchase plants using a clean, responsive interface.
  - Upload plant photos at intervals and receive growth‑based points.
  - View their total/available points, claim coupons, and apply them at checkout.
  - See their **orders** and payment details in a dedicated page.

- The backend:
  - Properly validates and compares uploads.
  - Blocks suspicious or extremely inconsistent uploads.
  - Maintains a clear reward and order history per user.

### 8.2 Discussion

- The **gamified approach** (points, coupons, leaderboard) can significantly improve user motivation to care for plants consistently.
- Image‑based growth metrics, even if approximate, give **tangible feedback** compared to just “remembering to water.”
- Areas for improvement:
  - More advanced and robust image comparison models (e.g., trained ML models).
  - Real‑time leaderboard based on actual live data instead of static demo entries.
  - Deeper integration with real plant inventories and logistics systems.

---

## 9. Conclusion & Future Work

### Conclusion

Vruksha demonstrates that:
- **Gamification + computer vision** can be combined to promote sustainable habits like plant care.
- A full‑stack architecture can support a complete loop:
  - Purchase → Care → Upload → Rewards → Re‑purchase.
- The current system is a solid prototype for:
  - Educational purposes
  - Demonstrating image‑based growth tracking
  - Showcasing a modern MERN‑style tech stack.

### Future Work

- **Advanced Image Analysis**
  - Introduce more robust segmentation and growth estimation techniques.
  - Detect plant health issues (disease, under‑watering) automatically.

- **Social Features**
  - Friend lists, shared gardens, challenges, and community feed.
  - Real, dynamic leaderboard sourced from user data.

- **Mobile App**
  - Native or hybrid mobile application for easier photo capture and notifications.

- **IoT Integration**
  - Integrate with smart pots/sensors (moisture, light) to enrich the scoring model.

- **Scalability & Production Hardening**
  - Cloud deployment, CDN for images, and horizontal scaling of API services.

---

## 10. Applications

- **Home Gardening & Hobbyists**
  - Motivates individuals to start and maintain home gardens.
  - Provides a fun, visual way to track personal progress.

- **Educational Institutions**
  - Use in schools/colleges as a project to teach:
    - Environmental awareness
    - Basic botany
    - Practical computer vision and web development.

- **Nurseries & Eco‑Stores**
  - Loyalty and engagement platform for customers buying plants.
  - Can drive repeat purchases via growth‑based coupons.

- **CSR & Sustainability Programs**
  - Corporate initiatives can use Vruksha‑like systems to involve employees in green challenges.

- **Research & Prototyping**
  - Base platform for experimenting with growth quantification methods and user engagement strategies.

---

> **Note:** This README is structured to mirror a typical academic/semiproject PPT format.  
> Each section can be directly converted into slides with diagrams, screenshots, and flowcharts from the implementation.


