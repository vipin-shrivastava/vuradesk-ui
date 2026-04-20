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

## Private Page Events
These events occur within the authenticated workspace.

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
| **Download File** | Click attachment | `/api/attachments/download/{id}` | `GET` | None |
| **Download All (ZIP)** | Click "Download All" | `/api/attachments/download/all` | `GET` | `ticketId`, `threadEntryId` (optional) |

### Administration & Settings
| Event Description | Trigger | Backend Endpoint | Method | Parameters / Request Body |
| :--- | :--- | :--- | :--- | :--- |
| **Fetch Agents** | Load team/assign list | `/api/users/list/agents-admins` | `GET` | None |
| **Save System Settings** | Submit settings form | `/api/system/admin/settings` | `PUT` | `appName`, `logoUrl`, `loginTagline`, `footerText`, etc. |
| **Fetch Roles** | Load access control | `/api/admin/roles` | `GET` | None |
| **Fetch Permissions** | Load role details | `/api/admin/permissions` | `GET` | None |
| **Manage Agents** | CRUD actions on team page | `/api/admin/agents` | `GET/POST/DELETE`| Depends on action |
| **Manage Mailboxes** | CRUD on mailbox settings | `/api/admin/mailboxes` | `GET/POST/DELETE`| Depends on action |
