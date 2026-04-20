# VuraDesk API Documentation

This document provides a comprehensive overview of the VuraDesk API endpoints, including request methods, URL paths, and expected request/response objects.

## Base URL
The base URL for all API endpoints is `http://localhost:8080/api` (default development).

---

## 1. Authentication (`/auth`)

### Login
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** `JwtResponse` (contains token, type, and UserDTO).

### Logout
- **Endpoint:** `POST /api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Blacklists the JWT token in Redis until expiration.

### Register
- **Endpoint:** `POST /api/auth/register`
- **Request Body:** `RegisterRequest` (firstName, lastName, email, password).
- **Response:** `UserDTO`.

### Activate Role
- **Endpoint:** `POST /api/auth/activate-role`
- **Description:** Sets the active role for the session and returns a new JWT with updated claims.
- **Request Body:**
  ```json
  {
    "roleName": "ROLE_AGENT"
  }
  ```

### Forgot Password
- **Endpoint:** `POST /api/auth/forgot-password`
- **Request Body:** `{"email": "..."}`.

### Reset Password
- **Endpoint:** `POST /api/auth/reset-password`
- **Request Body:** `{"token": "...", "newPassword": "..."}`.

---

## 2. User Management (`/users`)

### Current User Profile
- **Endpoint:** `GET /api/users/me`
- **Response:** `{"user": UserDTO}`.

### Update Profile
- **Endpoint:** `PUT /api/users/profile`
- **Request Body:** `UserProfileUpdateDTO` (firstName, lastName, phone).

### Change Password
- **Endpoint:** `POST /api/users/profile/change-password`
- **Request Body:** `ChangePasswordRequestDTO` (newPassword).

### Update Preferences
- **Endpoint:** `PUT /api/users/me/preferences`
- **Request Body:** `UserPreferencesDTO` (defaultRole).

### Search Users
- **Endpoint:** `GET /api/users/search?email={query}`
- **Permissions:** `user:manage`.

### List Agents & Admins
- **Endpoint:** `GET /api/users/list/agents-admins`
- **Permissions:** `ticket:assign`.

### User CRUD (Admin)
- **POST /api/users:** Create user.
- **GET /api/users/{id}:** Get user by ID.
- **PUT /api/users/{id}:** Update user.
- **DELETE /api/users/{id}:** Delete user.

---

## 3. Ticket Management (`/tickets`)

### List Tickets
- **Endpoint:** `GET /api/tickets`
- **Query Params:**
  - `tab` (String): e.g., "all", "me", "unassigned".
  - `departmentId` (Long).
  - `status` (TicketStatus): OPEN, IN_PROGRESS, RESOLVED, etc.
  - `priority` (TicketPriority): LOW, MEDIUM, HIGH, URGENT.
  - `page`, `size`, `sort`.

### Create Ticket
- **Endpoint:** `POST /api/tickets`
- **Request Body:** `TicketDTO` (subject, description, departmentId, etc.).

### Get Ticket Details
- **Endpoint:** `GET /api/tickets/{id}`
- **Response:** `TicketResponseDTO` (includes thread entries).

### Quick View
- **Endpoint:** `GET /api/tickets/{id}/quick-view`
- **Description:** Returns summary and last 3 replies.

### Update Ticket
- **Endpoint:** `PUT /api/tickets/{id}`
- **Request Body:** `TicketDTO`.

### Assign Ticket
- **Endpoint:** `PATCH /api/tickets/{id}/assign`
- **Request Body:** `{"userId": Long}`.

### Add Reply
- **Endpoint:** `POST /api/tickets/{ticketId}/replies`
- **Request Body:**
  ```json
  {
    "message": "...",
    "internal": false,
    "attachmentIds": []
  }
  ```

---

## 4. Dashboard (`/dashboard`)

### Dashboard Summary
- **Endpoint:** `GET /api/dashboard/summary`
- **Permissions:** `ADMIN` or `AGENT`.
- **Response:** `DashboardDTO` (counts, recent tickets, recent activity, online agents).

---

## 5. Attachments (`/attachments`)

### Upload Attachment
- **Endpoint:** `POST /api/attachments/upload`
- **Request:** `MultipartFile file`.

### Download Attachment
- **Endpoint:** `GET /api/attachments/download/{id}`.

### Delete Attachment
- **Endpoint:** `DELETE /api/attachments/{id}`.

---

## 6. Migration (`/migration`)

### Import Tickets
- **Endpoint:** `POST /api/migration/tickets/import`
- **Permissions:** `ADMIN` or `SUB_ADMIN`.
- **Description:** Asynchronous import from VuraDesk Intermediate Format (VIF).

---

## 7. Public Endpoints

### Departments
- **Endpoint:** `GET /api/public/departments`
- **Description:** List all departments for ticket creation.
