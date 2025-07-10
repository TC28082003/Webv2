# Web_waidiagmed

This is the repository for the Web_waidiagmed_final project, a web application designed for [**TODO: "Aiding medical diagnosis based on input parameters", "Managing diagnostic data", etc.**].

The application features a separate frontend and backend, containerized using Docker for ease of development and deployment.

## Features

*   User authentication (implied by JWT secret)
*   Data interaction with a MySQL database
*   Containerized setup using Docker Compose

## Technology Stack

*   **Frontend:** HTML, CSS, JavaScript, Nginx (served via Docker)
*   **Backend:** Node.js, Express.js (likely), `mysql2` Node.js driver
*   **Database:** MySQL (External - requires separate setup or connection to provided DB)
*   **Containerization:** Docker, Docker Compose

## Prerequisites

Before you begin, ensure you have met the following requirements:

*   **Git:** To clone the repository.
*   **Docker Engine:** Install Docker
*   **Docker Compose:** Install Docker Compose (often included with Docker Desktop).
*   **Access to a MySQL Database:** You will need connection details for a MySQL server. This could be a local installation or the one provided by UTC (`DB2.int.utc.fr`).

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [**TODO: Add the GitLab UTC SSH or HTTPS clone URL here**]
    cd Web_waidiagmed
    ```

2.  **Create Configuration File:**
    Create a file named `.env` in the root directory of the project (`Web_waidiagmed_final/`). **This file should NOT be committed to Git.**

3.  **Configure Environment Variables:**
    Add the following environment variables to your `.env` file, replacing the placeholder values with your actual database credentials and secrets:

    ```dotenv
    # Web_waidiagmed/.env

    # --- Database Configuration ---
    # Use 'host.docker.internal' if connecting to MySQL running directly on your Docker Desktop host machine (Win/Mac)
    # Use 'DB2.int.utc.fr' to connect to the UTC database
    DB_HOST=DB2.int.utc.fr
    DB_USER=waidiagmed
    DB_PASSWORD=[**TODO: Enter the UTC Database Password Here**]
    DB_DATABASE=waidiagmed

    # --- JWT Secret ---
    # Keep this secret or generate a new strong one
    JWT_SECRET=fc2f0f3162291219023a609bc5b9d6ba0f329d2f759c81dd56d9ae3fe024a61e2924b40f5a9592e4fc30ca2ee0d4a931eb46302cde6f632e74306c0289c6033036c209d6fbe3bf1904bd33f3ba5d345aa65cd07cfb8c5f146a6bcbab7f992e6131a2229408ede7a47b2e93b523c2b4d4a0f0b1e88cfbec4388dcb1d2c3baf223ce7566d7ad814aad91d9b60aa417b494f8fbfc78ea61d8f814a613db9bc3931f2919f4bb959ca5d692c44507c092fff0d7c67b36ef16f02e5c7825c8eea8250c

    # --- Backend Configuration ---
    # Port the backend service listens on *inside* the container
    PORT=3001
    ```
## Running the Application

1.  **Build and Start Containers:**
    Open a terminal in the project's root directory (`Web_waidiagmed_final/`) and run:
    ```bash
    docker-compose up --build
    ```
    *   `--build`: Forces Docker Compose to rebuild the images based on the `Dockerfile`s. You might not need this every time after the initial build if the code hasn't changed significantly.
    *   To run in the background (detached mode), use: `docker-compose up -d`

2.  **Accessing the Application:**
    *   The frontend should be accessible in your web browser at: `http://localhost:8080`
    *   The backend API runs internally within the Docker network. The frontend (Nginx) is configured to proxy API requests (e.g., to `/api/*`) to the backend service (`http://backend:3001`).

3.  **Stopping the Application:**
    *   If running in the foreground (without `-d`), press `Ctrl + C` in the terminal.
    *   If running in detached mode, use: `docker-compose down` (this stops and removes the containers).

4. **Create Tables in the Database:**
- Once the system is running, you need to connect to the MySQL database to create the necessary tables. You can use a tool like DBeaver, TablePlus, or MySQL Workbench to connect to `localhost` port `3306` with the credentials in the `.env` file.
- Run the following SQL statements to create the table:
```sql
CREATE DATABASE IF NOT EXISTS nav_app_db;
USE nav_app_db;

-- Users table
CREATE TABLE `users` (
`id` int NOT NULL AUTO_INCREMENT,
`email` varchar(255) NOT NULL,
`password_hash` varchar(255) NOT NULL,
`created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
UNIQUE KEY `email` (`email`)
);

-- User data table 
CREATE TABLE `user_data` ( 
`user_id` int NOT NULL, 
`saved_profiles` json DEFAULT NULL, 
`saved_profiles_parent` json DEFAULT NULL, 
`last_visited_profile` text, 
`virtual_profiles` json DEFAULT NULL, 
`virtual_profiles_data` json DEFAULT NULL, 
`created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP, 
`updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
PRIMARY KEY (`user_id`), 
CONSTRAINT `user_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE 
); 
```
## Project Structure

Web_waidiagmed/

├── .git/ # Git repository data

├── .idea/ # IDE configuration (usually ignored by Git)

├── backend/ # Node.js backend source code

│ ├── middleware/

│ ├── node_modules/ # (Should be ignored by Git & Docker copy

│ ├── routes/

│ ├── .dockerignore

│ ├── db.js # Database connection setup

│ ├── Dockerfile # Backend Docker build instructions

│ ├── package.json

│ ├── package-lock.json

│ └── server.js # Express server entry point

├── frontend/ # Frontend source code (HTML, CSS, JS)

│ ├── css/

│ ├── images/

│ ├── js/ # (Assuming JS files exist or will be added)

│ ├── .dockerignore

│ ├── Dockerfile # Frontend Docker build instructions (Nginx)

│ ├── index.html

│ ├── login.html

│ └── nginx.conf # Nginx configuration (proxies to backend)

├── prediction_service

│ ├── Dockerfile 

│ ├── app.py

│ ├── interative_prediction_service.py

│ ├── prediction_service.py

│ ├── requirements.txt

├── .env # Environment variables (NOT IN GIT)

├── .gitignore # Files/directories ignored by Git

├── docker-compose.yml # Docker Compose configuration

└── README.md # This file

## Contributing

"Please report issues via the GitLab issue tracker." or details on how to submit merge requests.