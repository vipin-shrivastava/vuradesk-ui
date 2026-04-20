# VuraDesk Functionality Documentation

This document describes the functional aspects of the VuraDesk ticketing system as implemented.

## 1. Multi-Tenancy
- **Isolation:** Each request is scoped to a tenant using the `X-Tenant-ID` header.
- **Data Privacy:** Core entities (Users, Tickets, etc.) are tenant-aware, ensuring data from one tenant is never accessible to another.

## 2. User Roles & Permissions
- **Admin:** Full system control, user management, and global reporting.
- **Sub-Admin:** High-level access with some restrictions on administrative settings.
- **Agent:** Focused on ticket resolution, responding to threads, and managing their queue.
- **Customer:** Simplified interface for creating and tracking their own tickets.
- **Granular Permissions:** Moving beyond roles, the system supports specific permissions like `CAN_VIEW_INTERNAL_NOTES`, `TICKET_ASSIGN`, etc.

## 3. Ticketing System
- **Life Cycle:** Support for ticket creation, status updates (Open -> In Progress -> Resolved -> Closed), and priority levels.
- **Threading:** Conversations are tracked as thread entries. Supports both public replies and **internal notes** (hidden from customers).
- **Attachments:** Support for uploading files to both tickets and thread entries.
- **Automatic Routing:** New tickets are automatically assigned to the least busy agent using the `TicketRoutingService`.
- **Search & Filter:** Advanced filtering by department, status, priority, and assignment.

## 4. Dashboard & Analytics
- **Live Metrics:** Real-time counts of open/closed tickets and high-priority items.
- **Activity Pulse:** A feed of recent system actions (audited events) to keep staff updated.
- **Staff Monitoring:** Real-time visibility of online agents.

## 5. Data Migration
- **VIF Support:** Ability to import tickets from external systems (osTicket, Zendesk, etc.) using the VuraDesk Intermediate Format.
- **Asynchronous Processing:** Large imports are handled in the background with persistent job status tracking.

## 6. Communication
- **Email Notifications:** Asynchronous notifications for ticket creation and customer replies.
- **Contextual UI:** The interface dynamically adapts based on the "Active Role" of the logged-in user.
