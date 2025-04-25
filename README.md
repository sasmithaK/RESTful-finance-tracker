# Personal Finance Tracker API

## Overview
This project is a secure RESTful API for a Personal Finance Tracker system. It allows users to manage transactions, track expenses, generate financial reports, and view chart data.

## Setup Instructions
### Prerequisites
Ensure you have the following installed:
- Node.js (v14 or later)
- MongoDB
- npm or yarn

### Installation
1. Clone the repository:
   ```sh
   git clone [https://github.com/your-repo/project-sasmithaK.git](https://github.com/SE1020-IT2070-OOP-DSA-25/project-sasmithaK.git)
   cd project-sasmithaK
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and add the following:
   ```env
   NODE_ENV=development
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```sh
   npm start
   ```
   The API should now be running on `http://localhost:5001`.

## API Endpoints
### Authentication
- **Register User**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`

### Transactions
- **Get All Transactions**: `GET /api/transactions`
- **Add Transaction**: `POST /api/transactions`
- **Update Transaction**: `PUT /api/transactions/:id`
- **Delete Transaction**: `DELETE /api/transactions/:id`

### Reports & Charts
- **Generate Financial Report**: `GET /api/transactions/report`
- **Generate Chart Data**: `GET /api/transactions/chart`

## Running Tests
### Unit Tests
Run the unit tests using:
```sh
npm test
```

