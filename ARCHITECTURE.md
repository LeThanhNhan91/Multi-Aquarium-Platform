# System Architecture - Multi-Store Aquarium E-Commerce

---

## Overview

This project is a **multi-store e-commerce platform** specialized for **live goods (ornamental fish)** and **aquarium accessories**.  
The system is designed to ensure **high scalability**, **strict data isolation between stores**, and **real-time transaction processing**.

---

## Backend Architecture (Clean Architecture)

The backend is built with **.NET 10**, following the **Separation of Concerns** principle:

### Aquarium.Domain
The core layer containing business entities such as `User`, `Store`, `Product`, `Order`, and fundamental business rules.  
This layer does **not depend on any external libraries or frameworks**.

### Aquarium.Application
Contains detailed business logic (**Use Cases**), repository interfaces, DTOs, and **Command / Query** definitions.  
This is where workflows such as **"Store Approval"** and **"Place Order"** are executed.

### Aquarium.Infrastructure
Implements technical details including:
- Entity Framework Core configuration  
- SQL Server connectivity  
- Media storage (Cloudinary / S3)  
- SignalR messaging system  

### Aquarium.Api
The presentation layer responsible for handling HTTP requests, managing **JWT authentication**, and **policy-based authorization**.

---

## Multi-Store Data Isolation

This is the **most critical mechanism** to ensure data security across the platform:

### Tenant Identification
`StoreId` is resolved from:
- **JWT Claims** (for Staff / Owner)  
- **StoreSlug in the URL** (for Customers)

### Query Filtering
All data queries related to:
- Products  
- Orders  
- Inventory  

**must be filtered by `StoreId`.**

### Security Rule
> The system **never trusts `StoreId` sent directly from the client**.

---

## Frontend Architecture (Next.js)

The frontend is built with **Next.js 14+ App Router**, using optimized rendering strategies:

### SSR (Server-Side Rendering)
Used for product listing pages and store detail pages to optimize SEO.

### ISR (Incremental Static Regeneration)
Used for static store information pages to achieve the highest performance.

### TanStack Query
Manages server-side data state, supports caching, and enables real-time synchronization.

---

## Key Business Features

### Inventory Management
Separates:
- `QuantityAvailable` (Available for sale)  
- `QuantityReserved` (Reserved)  

to properly handle the nature of live goods.

### Real-Time Interaction
The SignalR-based chat system enables direct communication between customers and stores for aquarium care consultation.

### Social Feed
Allows stores to publish product introductions in a social-feed-style format to increase engagement.

---

## Tech Stack

**Backend**
- .NET 10  
- Entity Framework Core  
- SQL Server  
- SignalR  

**Frontend**
- Next.js (App Router)  
- Tailwind CSS  
- TanStack Query  

**DevOps**
- GitHub Actions (CI/CD)  
- Docker Compose
