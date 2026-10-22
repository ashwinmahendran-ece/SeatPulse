# SeatPulse

A high-concurrency event ticketing platform featuring real-time seat locking, secure payments, and instant booking confirmations.

Built to handle simultaneous user transactions without double-booking, SeatPulse leverages a robust backend caching strategy and a modern, responsive frontend.

##  Tech Stack
* **Frontend:** React (Vite), TypeScript, Tailwind CSS, Zustand
* **Backend:** Java, Spring Boot, Spring Security (JWT)
* **Database & Caching:** MySQL, Redis (for 5-minute seat locks), RabbitMQ (for async processing)
* **Integrations:** Razorpay Payment Gateway

##  Key Features
* **Real-Time Seat Locking:** Users have a secure 5-minute window to complete checkout. Redis automatically expires the lock if payment is not finalized.
* **Stateless Authentication:** Secure login and registration using JWT and Axios interceptors.
* **Seamless Checkout Flow:** Integrated Razorpay test environment for processing ticket payments.
* **Concurrent Safety:** Strict database and cache synchronization to prevent overlapping seat purchases.

##  Getting Started

**Prerequisites:**
Node.js, Java 17+, Maven, MySQL, and Redis must be installed and running locally.

**1. Clone the repository**
git clone https://github.com/ashwinmahendran-ece/SeatPulse.git

**2. Backend Setup (Spring Boot)**
* Navigate to the root directory.
* Rename `application-template.properties` to `application.properties` and add your MySQL/Redis credentials.
* Run the application: `./mvnw spring-boot:run`

**3. Frontend Setup (React/Vite)**
* Navigate to the frontend directory: `cd seatpulse-ui`
* Install dependencies: `npm install`
* Create a `.env` file and add your Razorpay key: `VITE_RAZORPAY_KEY_ID=your_test_key`
* Start the development server: `npm run dev`