# iPosPays Integration Layer

## Overview

This project is a full-stack application designed to provide a robust and secure integration layer for the dejavoo.io iPosPays payment gateway. It acts as a comprehensive hub for handling multiple merchant accounts and all iPosPays features, designed to be easily dropped into most projects to provide payment services.

The integration prioritizes security and compliance, adhering to PCI-DSS standards by using Dejavoo's Hosted Payment Page (HPP) to ensure no sensitive cardholder data ever touches the server.

## Architecture

-   **Frontend:** A React single-page application provides the user interface for merchant registration, payment initiation, and transaction management.
-   **Backend:** A Node.js and Express server provides a RESTful API to communicate with the iPosPays gateway.
-   **Database:** MongoDB is used to store non-sensitive merchant and transaction data. Merchant API tokens are encrypted before being stored.

## Features

-   **Merchant Management:** Register new merchants and securely store their credentials.
-   **PCI-Compliant Payments:** Initiate payments using Dejavoo's Hosted Payment Page (HPP).
-   **Transaction Processing:** Full support for post-payment actions, including **Refunds** and **Voids**.
-   **Card Pre-Authorization:** Authorize a payment amount for later capture.
-   **Transaction History:** View a complete list of transactions for a specific merchant.
-   **Webhook Handling:** Receive and process real-time transaction status updates from Dejavoo.

---

## Getting Started

### Prerequisites

-   Node.js (v14 or later)
-   npm
-   MongoDB instance (running locally or on a cloud service)
-   A Dejavoo iPosPays merchant account with a TPN and Auth Token.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd ipospays-integration/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a `.env` file in the `ipospays-integration/backend` directory and add the following variables:

    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/ipospays
    FRONTEND_URL=http://localhost:3000
    BACKEND_URL=http://localhost:5000
    ENCRYPTION_KEY=your-super-secret-32-character-encryption-key
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```
    The backend server will be running on `http://localhost:5000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ipospays-integration/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the application:**
    ```bash
    npm start
    ```
    The frontend application will open in your browser at `http://localhost:3000`.

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Merchant Routes (`/merchants`)

-   `POST /register`: Register a new merchant.
    -   **Body:** `{ "name": "string", "tpn": "string", "authToken": "string" }`

### Payment Routes (`/payments`)

-   `POST /initiate`: Creates a new transaction and returns a Dejavoo HPP URL for payment.
    -   **Body:** `{ "merchantId": "string", "amount": "number" }`
-   `POST /webhook`: Webhook endpoint for Dejavoo to post transaction status updates.
-   `GET /history/:merchantId`: Retrieves all transactions for a given merchant.
-   `POST /refund/:transactionId`: Refunds a previously successful transaction.
    -   **Body:** `{ "amount": "number" }`
-   `POST /void/:transactionId`: Voids a previously successful transaction.
-   `POST /preauth`: Pre-authorizes a payment amount using a card token.
    -   **Body:** `{ "merchantId": "string", "cardToken": "string", "amount": "number" }`
-   `POST /capture`: Captures a previously pre-authorized payment.
    -   **Body:** `{ "merchantId": "string", "rrn": "string", "amount": "number" }`
