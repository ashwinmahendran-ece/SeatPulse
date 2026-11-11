# SeatPulse 🎟️⚡

A production-grade, high-concurrency event ticketing platform engineered to handle flash sales and race conditions at scale. SeatPulse ensures a seamless booking experience through distributed caching, asynchronous message brokering, and robust database locking mechanisms.

## 🚀 System Architecture & Core Engineering

### 1. High-Concurrency Race Condition Prevention
Handling thousands of simultaneous checkout attempts on the same seat requires strict database-level safeguards:
* **Optimistic Locking (`@Version`):** Upgraded from Pessimistic Locking to Optimistic Locking to eliminate database bottlenecks and HikariCP connection pool exhaustion during traffic spikes. The system safely rejects overlapping transactions with a `409 Conflict` (ObjectOptimisticLockingFailureException), allowing high throughput without freezing database rows.
* **State Management:** Seats transition dynamically between `AVAILABLE`, `LOCKED` (temporary hold during checkout), and `BOOKED` states.

### 2. Distributed Caching (Redis)
* **Sub-millisecond Reads:** The entire event seat map is cached in **Upstash Redis**, drastically reducing MySQL read loads during high-traffic browsing.
* **Smart Eviction:** Cache is automatically evicted (`@CacheEvict`) and rebuilt only when a state change occurs (a seat is locked, booked, or an event is completely deleted), ensuring strict data consistency between MySQL and the frontend.

### 3. Asynchronous Processing (RabbitMQ)
* **Decoupled Architecture:** Heavy I/O operations are offloaded to **CloudAMQP (RabbitMQ)** message queues to keep the main HTTP request threads lightning fast.
* **Automated Seat Release:** Implemented TTL (Time-To-Live) and Dead Letter Queues (DLQ). If a user locks a seat but fails to pay within the checkout window, RabbitMQ automatically routes the expired token to a release queue, immediately freeing the seat back to the public pool.
* **Bulk Notifications:** Email confirmations for batch ticket purchases are processed asynchronously by consumer workers.

### 4. Payment Gateway Integration
* **Razorpay:** End-to-end payment processing integrated via Razorpay test mode. The backend securely generates an `order_id`, and the React frontend launches the seamless checkout modal.
* **Cryptographic Verification:** Payment signatures are verified server-side before finalizing the database transaction and issuing the ticket.

### 5. Security & Authentication
* **Stateless Security:** Secured via **Spring Security** and **JWT (JSON Web Tokens)**.
* **Role-Based Access Control (RBAC):** Distinct `ADMIN` and `USER` authorities. Admins control event generation and deletion, while users handle seat bookings.
* **CORS Hardening:** Configured precise `allowedOriginPatterns` to safely support dynamic Vercel preview environments while enforcing `allowCredentials` for secure token exchange.

## 🛠️ Technology Stack

**Backend:**
* Java 17 / Spring Boot 3
* Spring Data JPA / Hibernate
* Spring Security + JWT
* MySQL (Aiven Cloud)
* Redis (Upstash)
* RabbitMQ (CloudAMQP)
* JUnit 5 & Mockito (Unit & Integration Testing)
* Maven

**Frontend:**
* React.js (Vite)
* JavaScript (ES6+) / HTML5 / CSS3
* Axios (Interceptors & Fallback Routing)
* Razorpay JS SDK

**DevOps & Deployment:**
* **Docker:** Containerized infrastructure (MySQL, Redis, RabbitMQ via WSL 2 Ubuntu backend) for isolated local development.
* **Render:** Live backend hosting.
* **Vercel:** Edge-deployed frontend with `vercel.json` SPA routing.
* **Git/GitHub:** Version control, secure `.env` isolation, and automated CI/CD deployment triggers.

## ⚙️ Local Development Setup

### Prerequisites
* Java 17+
* Node.js 18+
* Docker Desktop (Optional, for local backing services like Redis and RabbitMQ)

### Configuration & Secrets
This project uses environment variables to keep secrets secure. You will need to configure both the backend and frontend before running the application:

1. **Backend (Spring Boot):** Open `src/main/resources/application.properties`. You must inject your own environment variables (Database URIs, JWT Secrets, RabbitMQ credentials, Razorpay test keys) into the local environment to satisfy the `${VAR_NAME}` placeholders defined in this file.
2. **Frontend (React):** Create a `.env` file in the `seatpulse-ui` root directory. Refer to the provided `.env.example` file for the required `VITE_` prefixed keys (like `VITE_API_BASE_URL`).

### Running the Backend
```bash
# Clone the repository
git clone [https://github.com/ashwinmahendran-ece/SeatPulse.git]
cd SeatPulse

# Start backing services (if using Docker)
docker-compose up -d

# Build and run the Spring Boot application
mvn spring-boot:run
