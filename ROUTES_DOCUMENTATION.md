# UI Routes Documentation

This document lists all the available routes in the Vuradesk UI application, categorized by their access levels.

## Public Routes
These routes are accessible without authentication and use the `PublicLayout`.

| Page Description | Route | Component |
| :--- | :--- | :--- |
| **Login Page** | `/login` (or `/`) | `LoginPage` |
| **Registration Page** | `/register` | `RegisterPage` |
| **Public Ticket Submission** | `/submit-ticket` | `PublicTicketPage` |
| **Forgot Password** | `/forgot-password` | `ForgotPasswordPage` |
| **Reset Password** | `/reset-password` | `ResetPasswordPage` |
| **Setup Wizard** | `/setup` | `SetupWizard` |

---

## Private (Protected) Routes
These routes require a valid user session. Most of these use the `MainLayout` for navigation and sidebar.

| Page Description | Route | Component | Layout |
| :--- | :--- | :--- | :--- |
| **Select Role** | `/select-role` | `SelectRolePage` | None |
| **Dashboard** | `/dashboard` | `DashboardV2` | MainLayout |
| **All Tickets** | `/tickets` | `TicketListPage` | MainLayout |
| **My Tickets** | `/my-tickets` | `TicketListPage` (filtered) | MainLayout |
| **Ticket Details** | `/tickets/:ticketId` | `TicketDetailPage` | MainLayout |
| **Inbox** | `/inbox` | `TicketInboxLayout` | MainLayout |
| **Inbox Conversation** | `/inbox/:ticketId` | `TicketConversationPane` | MainLayout |
| **Customers** | `/customers` | `CustomerListPage` | MainLayout |
| **Settings** | `/settings` | `SettingsPage` | MainLayout |
| **Profile** | `/profile` | `ProfilePage` | MainLayout |
| **Access Control (Admin)** | `/admin/access-control` | `AccessControlPage` | MainLayout |
| **Team Management (Admin)**| `/admin/team` | `TeamPage` | MainLayout |
| **Edit Agent (Admin)** | `/admin/team/edit/:agentId` | `EditAgentPage` | MainLayout |
| **Mailbox Settings (Admin)**| `/admin/mailbox` | `MailboxPage` | MainLayout |
