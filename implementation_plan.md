# Implementation Plan - Milana Salon Management Portal

**Project Goal**: Build a specific, role-based salon management platform ("Milana Salon") with a modern, female-friendly "Light Green/Pastel" aesthetic.

## 1. Project Overview
- **Name**: Milana Salon Management Portal
- **Currency**: Ethiopian Birr (ETB)
- **Tech Stack**: React (Vite), Vanilla CSS (Variables for theming), React Router, Recharts (Analytics).
- **Target Audience**: Admin, Receptionist, Employee.

## 2. Design System & Theming
- **Theme**: Light Green / Pastel.
- **Aesthetics**: Rounded cards, elegant typography, glassmorphism touches, soft shadows.
- **Layout**:
    - **Mobile-First**: Scrollable tables, card-based views on small screens.
    - **Sidebar Navigation**: Differing links per role.

## 3. Role-Based Architecture
We will implement distinct layouts and routes for each role:
1.  **Admin** (`/admin`)
    - Full control (Users, Services, Financials).
    - Analytics (Revenue, Attendance).
2.  **Receptionist** (`/reception`)
    - Operational focus (Check-in, Service Assignment, Checkout).
3.  **Employee** (`/employee`)
    - Task-focused (My Assignments, History, Personal Commission).
    - *Privacy*: No access to salon revenue or other employees' data.

## 4. Key Features & Pages
### Shared
- **Login**: Role selection or specific credential login.
- **404/Unauthorized**: For role protection.

### Admin Features
- **Dashboard**: Revenue per branch, Top services (Light green graphs).
- **User Management**: Create/Edit Users, Assign Roles.
- **Service Management**: Price, Duration, Commission %.
- **Financials**: Commission reports (Export/Print), Payroll view.

### Receptionist Features
- **Dashboard**: Active sessions, Quick Actions.
- **Check-in flow**: Register Customer -> Start Session.
- **Checkout flow**: Invoice generation, Payment (Cash/Bank), Print Invoice.

### Employee Features
- **Dashboard**: Pending tasks, Active jobs.
- **My Assignments**: Status toggle (Pending -> In Progress -> Done).
- **My History**: Personal earnings (filtered).

## 5. Development Steps
1.  **Cleanup**: Remove old `sms-trivia` boilerplate.
2.  **Setup**: Configure `index.css` with the "Milana Green" palette.
3.  **Routing**: Set up `react-router-dom` with protected routes for Admin, Receptionist, Employee.
4.  **Components**:
    - `Card`, `Button`, `Table` (Horizontal scroll), `StatusBadge`.
    - `Layout` (Sidebar + Header).
5.  **Views (Iterative)**:
    - Phase 1: Shell & Dashboards.
    - Phase 2: Service & User Management (Admin).
    - Phase 3: Check-in/Checkout Flow (Receptionist).
    - Phase 4: Employee View & Commission Logic.

## 6. Data Model (Mock)
- **Users**: `{ id, name, role, branch, avatar }`
- **Services**: `{ id, name, price, commission_percent, duration }`
- **Sessions**: `{ id, customer, services: [], status, total, created_at }`
- **Invoices**: `{ id, session_id, amount, payment_method, date }`

## Next Steps for User
- Confirm if we should **wipe** the existing `src` folder (which seems to be `sms-trivia`) to start fresh with this structure.
