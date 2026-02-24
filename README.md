# Multi-Store Aquarium Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <br />
  <img src="https://img.shields.io/badge/.NET_Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET Core" />
  <img src="https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white" alt="C#" />
  <img src="https://img.shields.io/badge/SignalR-0078D4?style=for-the-badge&logo=microsoft&logoColor=white" alt="SignalR" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
</p>

## About The Project

**Multi-Store Aquarium Platform** is a comprehensive e-commerce and social networking system tailored specifically for the aquarium community. 

Unlike traditional e-commerce sites, this platform empowers multiple store owners to not only sell their products but also engage directly with their customers through a vibrant social newsfeed and real-time chat. It bridges the gap between a marketplace and a specialized social community.

## Key Features

### Multi-Vendor E-commerce
* **Store Management:** Store owners can manage their profiles, business hours, and staff members (Owners, Managers, Staff).
* **Inventory & Order Management:** Centralized dashboard to track stock levels, process orders, and handle multi-store cart checkouts safely with Database Transactions.
* **Product Catalog:** Advanced filtering, pagination, and search capabilities.

### Social Feed & Community
* **Interactive Newsfeed:** Stores can post updates, showcase new fish arrivals, or share knowledge using images and videos.
* **Engagement:** Customers can like and comment on posts (Infinite Scroll supported).
* **Media Management:** Seamless high-quality image and video uploads powered by Cloudinary.

### Real-Time Communication
* **Live Chat System:** Direct messaging between customers and store staff.
* **Instant Notifications:** Powered by SignalR, users receive immediate updates for new messages, unread counts, and "seen" statuses.

## Tech Stack

### Frontend
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **State Management & Data Fetching:** Redux Toolkit & RTK Query
* **Styling:** Tailwind CSS & Shadcn UI

### Backend
* **Framework:** ASP.NET Core Web API (C#)
* **Database & ORM:** SQL Server with Entity Framework Core
* **Real-time Engine:** SignalR
* **Media Storage:** Cloudinary
* **Architecture:** Clean Architecture & Repository Pattern

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
* SQL Server

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/your-username/multi-store-aquarium.git](https://github.com/your-username/multi-store-aquarium.git)
   cd multi-store-aquarium
