# Las Tortillas Mexican Grill Website

## Overview
Las Tortillas Mexican Grill is a full-stack web application for a Mexican restaurant in Luanda, Angola. This application serves as a comprehensive system for customers to browse the menu, make reservations, and submit contact inquiries, reflecting the restaurant's family-friendly dining experience established since February 14, 2018. The project aims to provide a modern, responsive online presence with features for efficient restaurant operations and customer engagement.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom Mexican-inspired color scheme
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **UI/UX Decisions**: Incorporates Mexican branding with gradient color palettes (sunset, fiesta, terra, fresh), glassmorphism effects, floating background elements, sophisticated hover effects, 3D transformations for menu cards, and an elegant badge system. Responsive design is prioritized across all components, from headers and navigation to order cards and login pages, ensuring optimal display on smartphones and tablets.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas for API request/response validation
- **Storage**: Local file storage for images and other assets.

### Core Features & Implementations
- **Navigation**: Fixed header with smooth scroll, integrated location selection, unified header design.
- **Menu Management**: Dynamic display of menu items, with categories and search functionality.
- **Reservation System**: Interactive form for table reservations with availability checks.
- **Contact Inquiries**: Form for customer queries.
- **Order Management System**:
    - **Online Ordering**: Fully responsive interface for customers to place orders, with a persistent cart system.
    - **Kitchen Panel**: Comprehensive, responsive kitchen management interface for real-time order tracking, manual preparation time setting, and visual order type indicators (takeaway, dine-in, delivery). Includes sound notifications for new orders.
    - **Admin Controls**: Secure login with role-based access (admin/kitchen), comprehensive dashboard for order management, quick order creation, and advanced filtering.
    - **Table Management**: Integrated table selection for dine-in orders, automatic table status updates (occupied/available), and a robust table creation system with bulk options and visual indicators.
- **Authentication**: Custom localStorage-based authentication system for admin access, replacing external services.
- **Multi-location Support**: System to manage and display multiple restaurant locations with detailed information.
- **Performance Optimization**: Lazy loading for images, caching for backend APIs, memoization of React components, and performance-focused CSS.

## External Dependencies

### Frontend Dependencies
- `@radix-ui/react-*`: UI component primitives
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animation library
- `tailwindcss`: CSS framework
- `wouter`: Routing library
- `date-fns`: Date manipulation utilities

### Backend Dependencies
- `express`: Web application framework
- `drizzle-orm`: ORM for database operations
- `postgres`: PostgreSQL client for database connectivity
- `zod`: Schema validation library
- `connect-pg-simple`: PostgreSQL session store (if session management is used)

### Development Dependencies
- `vite`: Build tool and development server
- `typescript`: Type safety