# UI Routes Documentation

This document lists all the available routes in the Vuradesk UI application, categorized by their access levels.

## Public Routes
These routes are accessible without authentication and use the `PublicLayout`.

| Page Description | Route | Component |
| :--- | :--- | :--- |
| **Login Page** | `{appName}/login` | `LoginPage` |
| **Registration Page** | `{appName}/public/register` | `RegisterPage` |
| **Public Ticket Submission** | `{appName}/public/submit-ticket` | `PublicTicketPage` |
| **Forgot Password** | `{appName}/public/forgot-password` | `ForgotPasswordPage` |
| **Reset Password** | `{appName}/public/reset-password` | `ResetPasswordPage` |
| **Setup Wizard** | `public/setup` | `SetupWizard` |

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
