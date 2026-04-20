# UI Events & Backend Interactions Documentation

This document outlines the user actions (events) in the UI and the corresponding backend API calls they trigger.

## Public Page Events
These events occur on pages accessible without authentication.

| Event Description | Trigger | Backend Endpoint | Method | Parameters / Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **Login** | Submit login form | `/api/auth/login` | `POST` | `email`, `password` |
| **Register** | Submit registration form | `/api/auth/register` | `POST` | `firstName`, `lastName`, `email`, `password` |
| **Forgot Password** | Submit forgot password form | `/api/auth/forgot-password` | `POST` | `email` |
| **Reset Password** | Submit reset password form | `/api/auth/reset-password` | `POST` | `token`, `newPassword` |
| **Submit Public Ticket** | Submit ticket form | `/api/public/tickets` | `POST` | `firstName`, `lastName`, `creatorEmail`, `subject`, `description`, `departmentId` |
| **Initialize Setup** | Finalize Setup Wizard | `/api/public/setup/initialize` | `POST` | `databaseConfig`, `adminAccount`, `systemSettings` |
| **Fetch Departments** | Load ticket form | `/api/public/departments` | `GET` | None |
| **Fetch System Settings**| Initial app load | `/api/system/public/settings` | `GET` | None |

---

## Private Page (Workspace) Events
These events occur within the authenticated workspace for agents and customers.

### Dashboard & Analytics
| Event Description | Trigger | Backend Endpoint | Method | Parameters / Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **Fetch Dashboard** | Load dashboard page | `/api/dashboard/summary` | `GET` | None |

### Ticket Management
| Event Description | Trigger | Backend Endpoint | Method | Parameters / Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **List Tickets** | Load tickets list | `/api/tickets` | `GET` | `page`, `size`, `filter` (my-tickets/all) |
| **View Ticket Details** | Click on a ticket | `/api/tickets/{ticketId}` | `GET` | None (path variable) |
| **Submit Reply** | Send reply/internal note | `/api/tickets/{ticketId}/replies` | `POST` | `message`, `internal` (bool), `attachmentIds` |
| **Update Status** | Change status dropdown | `/api/tickets/{ticketId}/status` | `PATCH` | `status` |
| **Assign Agent** | Select agent from dropdown | `/api/tickets/{ticketId}/assign` | `PATCH` | `userId` |
| **Upload Attachment** | Select file in reply box | `/api/attachments/upload` | `POST` | `file` (Multipart/form-data) |
| **Download File** | Click attachment | `/api/attachments/{id}/download` | `GET` | None |
| **Download All (ZIP)** | Click "Download All" | `/api/attachments/download/all` | `GET` | `ticketId`, `threadEntryId` (optional) |

---

## Administrative Events & Endpoints (/admin/)
These actions are restricted to users with `ADMIN` roles and manage system-wide configurations.

### UI Routes
| Page Name | UI Route Path | Description |
| :--- | :--- | :--- |
| **Team Management** | `/admin/team` | Manage agents, roles, and status. |
| **Access Control** | `/admin/access-control` | Manage roles and permissions mapping. |
| **Mailbox Settings** | `/admin/mailbox` | Configure email channels (SMTP/IMAP). |

### Backend API Endpoints
| Event Description | Backend Endpoint | Method | Backend Controller |
| :--- | :--- | :--- | :--- |
| **System Settings** | `/api/system/admin/settings` | `PUT` | `SystemSettingsController` |
| **Manage Roles** | `/api/admin/roles` | `GET/POST/PUT/DELETE` | `RoleController` |
| **Manage Permissions** | `/api/admin/permissions` | `GET` | `PermissionController` |
| **Manage Agents** | `/api/admin/users` | `GET/POST/PUT/PATCH` | `AdminController` |
| **Manage Mailboxes** | `/api/admin/email-channels` | `GET/POST/PUT` | `EmailChannelController` |

---

## Common Backend Endpoint Usage Patterns

Several core entities are accessed in both Public and Private contexts. The backend follows a consistent naming convention where public-facing endpoints are prefixed with `/public/`.

### 1. Departments
Used for categorizing tickets during submission.
*   **Public**: `/api/public/departments` (Fetching list for guest users)
*   **Private**: `/api/departments` (Fetching list for authenticated users/agents)

### 2. System Settings
Used for branding (App Name, Logo, etc.).
*   **Public**: `/api/system/public/settings` (ReadOnly, unauthenticated)
*   **Private**: `/api/system/settings` (ReadOnly, authenticated)
*   **Admin**: `/api/system/admin/settings` (Read/Write, restricted to Admin role)

---

## Backend Endpoint Verification Status

This section tracks the availability and correctness of backend endpoints used by the UI.

### Public & Workspace Endpoints
| Endpoint | Status | Backend Controller | Notes |
| :--- | :--- | :--- | :--- |
| `/api/auth/*` | ✅ Available | `AuthController` | Login, Register, Forgot/Reset password confirmed. |
| `/api/public/tickets` | ✅ Available | `PublicTicketController` | Confirmed. |
| `/api/public/setup/*` | ✅ Available | `SetupController` | `initialize` and `status` confirmed. |
| `/api/public/departments`| ✅ Available | `PublicDepartmentController`| Confirmed. |
| `/api/system/public/settings`| ✅ Available | `SystemSettingsController`| Confirmed. |
| `/api/dashboard/summary` | ✅ Available | `DashboardController` | Confirmed. |
| `/api/tickets` (GET/POST) | ✅ Available | `TicketController` | Confirmed. |
| `/api/tickets/{id}` | ✅ Available | `TicketController` | Confirmed. |
| **`/api/tickets/{id}/status`**| ✅ **Available** | `TicketController` | Added specific PATCH for status update. |
| `/api/tickets/{id}/assign` | ✅ Available | `TicketController` | Confirmed (PATCH). |
| `/api/tickets/{id}/replies`| ✅ Available | `TicketThreadController`| Confirmed. |
| `/api/attachments/upload` | ✅ Available | `AttachmentController` | Confirmed. |
| `/api/attachments/{id}/download`| ✅ Available | `AttachmentController` | Confirmed. |
| `/api/attachments/download/all`| ✅ Available | `AttachmentController` | Confirmed. |
| `/api/users/list/agents-admins`| ✅ Available | `UserController` | Confirmed (Returns Page object). |

### Administrative Endpoints (/admin/)
| Endpoint | Status | Backend Controller | Notes |
| :--- | :--- | :--- | :--- |
| `/api/admin/roles` | ✅ Available | `RoleController` | Confirmed. |
| `/api/admin/permissions` | ✅ Available | `PermissionController` | Confirmed. |
| `/api/admin/users` | ✅ Available | `AdminController` | Confirmed. |
| `/api/admin/email-channels` | ✅ Available | `EmailChannelController` | Confirmed. |
| `/api/system/admin/settings` | ✅ Available | `SystemSettingsController` | Confirmed. |


## Administrative Events & Endpoints (/admin/)
These actions are restricted to users with `ADMIN` roles and manage system-wide configurations.

### UI Routes
| Page Name | UI Route Path | Description |
| :--- | :--- | :--- |
| **Team Management** | `/admin/team` | Manage agents, roles, and status. |
| **Access Control** | `/admin/access-control` | Manage roles and permissions mapping. |
| **Mailbox Settings** | `/admin/mailbox` | Configure email channels (SMTP/IMAP). |

### Backend API Endpoints
| Event Description | Backend Endpoint | Method | Backend Controller |
| :--- | :--- | :--- | :--- |
| **System Settings** | `/api/system/admin/settings` | `PUT` | `SystemSettingsController` |
| **Manage Roles** | `/api/admin/roles` | `GET/POST/PUT/DELETE` | `RoleController` |
| **Manage Permissions** | `/api/admin/permissions` | `GET` | `PermissionController` |
| **Manage Agents** | `/api/admin/users` | `GET/POST/PUT/PATCH` | `AdminController` |
| **Manage Mailboxes** | `/api/admin/email-channels` | `GET/POST/PUT` | `EmailChannelController` |

