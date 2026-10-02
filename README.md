# IEMI Quotes — B2B Quoting & Client Management System

IEMI Quotes is a full-stack web application developed to digitize and automate the corporate sales cycle. It replaces manual document creation with a secure, cloud-based system that allows for managing client databases, calculating prices and taxes in real-time, and issuing precise commercial quotes in PDF format.

This solution is designed to streamline financial operations, eliminate calculation errors, and standardize the business's commercial presentation using a modern, containerized architecture.

## 🚀 Key Features

* **Dynamic Quoting Engine:** Automated calculation of subtotals, taxes, and total costs, integrating configurable commercial terms (validity periods, delivery methods, and warranties).
* **Automated Document Generation:** Instant creation and downloading of commercial quotes in a professional PDF format, ready for distribution.
* **Client Management (CRM):** Centralized directory to register, update, and manage corporate contact information to streamline future quotes.
* **Secure Access Control:** Restricted login system protected by credential encryption (`bcryptjs`) and persistent session management within the database.
* **Intelligent Identification System:** Automatic generation of sequential folio numbers to maintain strict control over the sales history.

## 🛠️ Tech Stack & Architecture

* **Frontend:** React, Vite, HTML5, CSS3.
* **Backend (RESTful API):** Node.js, Express.
* **Database:** MySQL (relational cluster hosted and managed on DigitalOcean).
* **PDF Generation:** `@react-pdf/renderer`.
* **DevOps & Infrastructure:** Containerized architecture with Docker and Docker Compose, designed to be deployed behind an Nginx reverse proxy.

## ⚙️ Prerequisites

To run this project in a local environment, you need to have installed:
* [Docker](https://www.docker.com/get-started) and Docker Compose.
* [Git](https://git-scm.com/).

## 💻 Local Installation & Deployment

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/your-repository.git](https://github.com/your-username/your-repository.git)
   cd your-repository

- Configure environment variables:
Create a file named .env in the root of the project. This file is not included in version control for security reasons. Add the following credentials:
   ```bash
   DB_PASSWORD=your_mysql_password

- Build and start the containers with Docker:
Run the following command to install dependencies, package the application, and start the services (Frontend and Backend):

  ```bash
  docker-compose up -d --build

- Access the application:
Once the containers are running, open your browser and visit:

Frontend (User Interface): http://localhost:5000

Backend (API): http://localhost:3005


🔒 Security & Best Practices
Environment Isolation: The project utilizes docker-compose.yml to ensure the application runs identically across any environment, securely managing the internal network between Node.js and React.

Credential Protection: Database passwords are injected at runtime via the .env file, keeping the source code completely clean and safe for public repositories.

👨‍💻 Author
Martin Munoz
