# VuraDesk API Endpoints Documentation for Frontend Integration

This document outlines the available REST API endpoints for the VuraDesk application, including their HTTP methods, descriptions, request parameters, and expected responses. This comprehensive guide is intended for frontend developers to facilitate seamless integration.

---

## 1. Authentication Module

**Base URL:** `/api/auth`

### 1.1. User Login

*   **Endpoint:** `/api/auth/login`
*   **HTTP Method:** `POST`
*   **Description:** Authenticates a user and returns a JWT token upon successful login.
*   **Request Body:** `LoginRequest` (JSON object)
    ```json
    {
        "email": "user@example.com",
        "password": "yourpassword"
    }
    ```
*   **Response:** `200 OK` - Returns a `JwtResponse` object containing the JWT token and user details.
    ```json
    {
        "token": "eyJhbGciOiJIUzUxMiJ9...",
        "type": "Bearer",
        "id": 1,
        "username": "user@example.com",
        "role": "AGENT" // or ADMIN, CUSTOMER, etc.
    }
    ```
*   **Error Response:** `401 Unauthorized` if authentication fails (e.g., invalid credentials).

---

## 2. User Management Module

**Base URL:** `/api/users`

### 2.1. Create User

*   **Endpoint:** `/api/users`
*   **HTTP Method:** `POST`
*   **Description:** Creates a new user in the system.
*   **Request Body:** `UserDTO` (JSON object)
    ```json
    {
        "username": "john.doe",
        "email": "john.doe@example.com",
        "password": "securepassword123",
        "firstName": "John",
        "lastName": "Doe",
        "role": "CUSTOMER" // Example: ADMIN, AGENT, CUSTOMER
    }
    ```
*   **Response:** `201 Created` - Returns the created `UserDTO` object.
    ```json
    {
        "id": 1,
        "username": "john.doe",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "CUSTOMER"
    }
    ```
*   **Error Response:** `400 Bad Request` if input data is invalid or `409 Conflict` if a user with the same email/username already exists.

### 2.2. Get User by ID

*   **Endpoint:** `/api/users/{id}`
*   **HTTP Method:** `GET`
*   **Description:** Retrieves a user by their unique ID.
*   **Path Parameter:** `id` (Long) - The ID of the user to retrieve.
*   **Response:** `200 OK` - Returns the `UserDTO` object for the specified ID.
    ```json
    {
        "id": 1,
        "username": "john.doe",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "CUSTOMER"
    }
    ```
*   **Error Response:** `404 Not Found` if the user does not exist.

### 2.3. Get All Users

*   **Endpoint:** `/api/users`
*   **HTTP Method:** `GET`
*   **Description:** Retrieves a list of all users.
*   **Response:** `200 OK` - Returns a list of `UserDTO` objects.
    ```json
    [
        {
            "id": 1,
            "username": "john.doe",
            "email": "john.doe@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "CUSTOMER"
        },
        {
            "id": 2,
            "username": "jane.smith",
            "email": "jane.smith@example.com",
            "firstName": "Jane",
            "lastName": "Smith",
            "role": "AGENT"
        }
    ]
    ```

### 2.4. Update User

*   **Endpoint:** `/api/users/{id}`
*   **HTTP Method:** `PUT`
*   **Description:** Updates an existing user identified by their ID.
*   **Path Parameter:** `id` (Long) - The ID of the user to update.
*   **Request Body:** `UserDTO` (JSON object with updated user data)
    ```json
    {
        "username": "john.doe.updated",
        "email": "john.doe.updated@example.com",
        "firstName": "Jonathan",
        "lastName": "Doe",
        "role": "CUSTOMER"
    }
    ```
*   **Response:** `200 OK` - Returns the updated `UserDTO` object.
    ```json
    {
        "id": 1,
        "username": "john.doe.updated",
        "email": "john.doe.updated@example.com",
        "firstName": "Jonathan",
        "lastName": "Doe",
        "role": "CUSTOMER"
    }
    ```
*   **Error Response:** `404 Not Found` if the user does not exist, `400 Bad Request` if input data is invalid.

### 2.5. Delete User

*   **Endpoint:** `/api/users/{id}`
*   **HTTP Method:** `DELETE`
*   **Description:** Deletes a user by their unique ID.
*   **Path Parameter:** `id` (Long) - The ID of the user to delete.
*   **Response:** `204 No Content` - Indicates successful deletion.
*   **Error Response:** `404 Not Found` if the user does not exist.

---

## 3. Ticket Management Module

**Base URL:** `/api/tickets`

### 3.1. Create Ticket

*   **Endpoint:** `/api/tickets`
*   **HTTP Method:** `POST`
*   **Description:** Creates a new support ticket.
*   **Request Body:** `TicketDTO` (JSON object)
    ```json
    {
        "title": "My printer is not working",
        "description": "I tried restarting it, but it's still not printing.",
        "priority": "HIGH", // LOW, MEDIUM, HIGH, URGENT
        "status": "OPEN",   // OPEN, IN_PROGRESS, RESOLVED, CLOSED
        "assignedAgentId": null, // Optional: ID of the agent to assign
        "customerId": 1 // ID of the customer creating the ticket
    }
    ```
*   **Response:** `201 Created` - Returns the created `TicketDTO` object.
    ```json
    {
        "id": 101,
        "title": "My printer is not working",
        "description": "I tried restarting it, but it's still not printing.",
        "priority": "HIGH",
        "status": "OPEN",
        "createdAt": "2023-10-27T10:00:00Z",
        "updatedAt": "2023-10-27T10:00:00Z",
        "customerId": 1
    }
    ```
*   **Error Response:** `400 Bad Request` if input data is invalid.

### 3.2. Get Ticket by ID

*   **Endpoint:** `/api/tickets/{id}`
*   **HTTP Method:** `GET`
*   **Description:** Retrieves a ticket by its unique ID.
*   **Path Parameter:** `id` (Long) - The ID of the ticket to retrieve.
*   **Response:** `200 OK` - Returns the `TicketDTO` object for the specified ID.
    ```json
    {
        "id": 101,
        "title": "My printer is not working",
        "description": "I tried restarting it, but it's still not printing.",
        "priority": "HIGH",
        "status": "OPEN",
        "createdAt": "2023-10-27T10:00:00Z",
        "updatedAt": "2023-10-27T10:00:00Z",
        "customerId": 1
    }
    ```
*   **Error Response:** `404 Not Found` if the ticket does not exist.

### 3.3. Get All Tickets

*   **Endpoint:** `/api/tickets`
*   **HTTP Method:** `GET`
*   **Description:** Retrieves a list of all tickets.
*   **Response:** `200 OK` - Returns a list of `TicketDTO` objects.
    ```json
    [
        {
            "id": 101,
            "title": "My printer is not working",
            "description": "I tried restarting it, but it's still not printing.",
            "priority": "HIGH",
            "status": "OPEN",
            "createdAt": "2023-10-27T10:00:00Z",
            "updatedAt": "2023-10-27T10:00:00Z",
            "customerId": 1
        },
        {
            "id": 102,
            "title": "Software installation issue",
            "description": "Cannot install new accounting software.",
            "priority": "MEDIUM",
            "status": "IN_PROGRESS",
            "createdAt": "2023-10-26T15:30:00Z",
            "updatedAt": "2023-10-27T09:00:00Z",
            "assignedAgentId": 5,
            "customerId": 2
        }
    ]
    ```

### 3.4. Search Tickets

*   **Endpoint:** `/api/tickets/search`
*   **HTTP Method:** `GET`
*   **Description:** Searches for tickets based on various criteria.
*   **Query Parameters:** `TicketSearchRequest` (can include fields like `title`, `description`, `priority`, `status`, `assignedAgentId`, `customerId`, `startDate`, `endDate`, `page`, `size`, `sortBy`, `sortDir`).
    *   Example: `/api/tickets/search?status=OPEN&priority=HIGH&page=0&size=10`
*   **Response:** `200 OK` - Returns a list of `TicketDTO` objects matching the search criteria.
    ```json
    [
        {
            "id": 101,
            "title": "My printer is not working",
            "description": "I tried restarting it, but it's still not printing.",
            "priority": "HIGH",
            "status": "OPEN",
            "createdAt": "2023-10-27T10:00:00Z",
            "updatedAt": "2023-10-27T10:00:00Z",
            "customerId": 1
        }
    ]
    ```

### 3.5. Update Ticket

*   **Endpoint:** `/api/tickets/{id}`
*   **HTTP Method:** `PUT`
*   **Description:** Updates an existing ticket identified by its ID.
*   **Path Parameter:** `id` (Long) - The ID of the ticket to update.
*   **Request Body:** `TicketDTO` (JSON object with updated ticket data)
    ```json
    {
        "title": "My printer is not working (resolved)",
        "description": "Replaced toner cartridge, issue resolved.",
        "priority": "HIGH",
        "status": "RESOLVED",
        "assignedAgentId": 5
    }
    ```
*   **Response:** `200 OK` - Returns the updated `TicketDTO` object.
    ```json
    {
        "id": 101,
        "title": "My printer is not working (resolved)",
        "description": "Replaced toner cartridge, issue resolved.",
        "priority": "HIGH",
        "status": "RESOLVED",
        "createdAt": "2023-10-27T10:00:00Z",
        "updatedAt": "2023-10-27T11:30:00Z",
        "assignedAgentId": 5,
        "customerId": 1
    }
    ```
*   **Error Response:** `404 Not Found` if the ticket does not exist, `400 Bad Request` if input data is invalid.

### 3.6. Delete Ticket

*   **Endpoint:** `/api/tickets/{id}`
*   **HTTP Method:** `DELETE`
*   **Description:** Deletes a ticket by its unique ID.
*   **Path Parameter:** `id` (Long) - The ID of the ticket to delete.
*   **Response:** `204 No Content` - Indicates successful deletion.
*   **Error Response:** `404 Not Found` if the ticket does not exist.

---

## 4. Ticket Migration Module

**Base URL:** `/api/migration`

### 4.1. Import Tickets

*   **Endpoint:** `/api/migration/tickets/import`
*   **HTTP Method:** `POST`
*   **Description:** Initiates an asynchronous job to import tickets from a JSON file.
*   **Authorization:** Requires `ADMIN` or `SUB_ADMIN` role.
*   **Request Body:** `multipart/form-data` with a file part named `file`.
    *   **Parameter:** `file` (MultipartFile) - The JSON file containing ticket data.
    *   **Content-Type:** Must be `application/json`.
*   **Response:** `202 Accepted` - Returns a message with the job ID.
    ```
    Migration job started with ID: [UUID]
    ```
*   **Error Response:**
    *   `400 Bad Request` if no file is provided or if the file is not JSON.
    *   `403 Forbidden` if the user does not have the required role.

### 4.2. Get Migration Status

*   **Endpoint:** `/api/migration/status/{jobId}`
*   **HTTP Method:** `GET`
*   **Description:** Retrieves the status of a previously initiated migration job.
*   **Authorization:** Requires `ADMIN`, `SUB_ADMIN`, `AGENT`, or `CUSTOMER` role.
*   **Path Parameter:** `jobId` (UUID) - The ID of the migration job.
*   **Response:** `200 OK` - Returns a `MigrationJobStatus` object.
    ```json
    {
        "jobId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "status": "IN_PROGRESS", // PENDING, IN_PROGRESS, COMPLETED, FAILED
        "progress": 50,         // Percentage of completion
        "message": "Processing 50 of 100 records.",
        "startTime": "2023-10-27T10:00:00Z",
        "endTime": null,
        "totalRecords": 100,
        "processedRecords": 50,
        "failedRecords": 0
    }
    ```
*   **Error Response:**
    *   `404 Not Found` if the `jobId` does not exist.
    *   `403 Forbidden` if the user does not have the required role.

---

## Important Notes for Frontend Developers:

*   **Authentication:** All authenticated endpoints require a JWT token in the `Authorization` header (e.g., `Authorization: Bearer <your_jwt_token>`).
*   **Error Handling:** Be prepared to handle various HTTP status codes (e.g., 400, 401, 403, 404, 500) and display appropriate messages to the user.
*   **Data Consistency:** For `PUT` requests, ensure you send the complete `DTO` object, even for fields that are not changing, to avoid unintended data loss.
*   **Asynchronous Operations:** The ticket import is an asynchronous operation. The frontend should poll the `/api/migration/status/{jobId}` endpoint to get updates on the job's progress.
*   **CORS:** Ensure your frontend application is configured to handle Cross-Origin Resource Sharing (CORS) if it's hosted on a different domain/port than the backend.
*   **Environment Variables:** Use environment variables for API base URLs and other configuration that changes between development, staging, and production environments.
*   **Swagger/OpenAPI:** For future enhancements, consider integrating Swagger/OpenAPI to automatically generate and maintain API documentation.

---
