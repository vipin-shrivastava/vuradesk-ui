# VuraDesk Security Documentation

This document outlines the security architecture and implementations in VuraDesk.

## 1. Authentication
- **JWT (JSON Web Tokens):** Used for stateless authentication. Tokens contain user ID, tenant ID, and multiple role claims.
- **Session Invalidation:** Implements a "Redis Kill-Switch". On logout, the token's `jti` (unique ID) is stored in Redis with a TTL, blacklisting it until it expires.
- **Password Hashing:** Uses `BCryptPasswordEncoder` with a high strength factor for storing user credentials.

## 2. Authorization
- **RBAC (Role-Based Access Control):** Standard roles (Admin, Agent, etc.) control access to major modules.
- **PBAC (Permission-Based Access Control):** Fine-grained permissions (e.g., `user:manage`) are checked at the service level using Spring Security's `@PreAuthorize`.
- **Role Switching:** Users with multiple roles can switch their "Active Role" via `/api/auth/activate-role`. The `X-Active-Role` header ensures the system behaves according to the selected context.

## 3. Data Isolation (Multi-Tenancy)
- **Tenant Filter:** Every request must include an `X-Tenant-ID` header.
- **Hibernate Filters:** Automatically injects tenant-specific `WHERE` clauses into all database queries, preventing cross-tenant data leakage at the DB level.

## 4. Auditing
- **AOP Auditing:** Custom `@Auditable` annotation triggers logging of critical actions.
- **Details Captured:** Action type, entity ID, performer's username, timestamp, and "before/after" state snapshots for updates.

## 5. Transport & CORS
- **CORS Configuration:** Strictly defined allowed origins (e.g., `http://localhost:5173`) and exposed headers (`X-Active-Role`, `X-Tenant-ID`).
- **Input Validation:** Comprehensive use of `jakarta.validation` annotations on all DTOs to prevent injection and malformed data.

## 6. Security Headers
- **Global Filters:** Security filters handle authentication, tenant validation, and token blacklisting sequentially before requests reach the controller.
