# Inventory Management System - Credentials & Access Details

This document contains all login credentials, database details, API URLs, and configuration settings for the **Inventory Management System**.

---

## 🌐 Application URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:3000/](http://localhost:3000/) | React + Vite UI Dashboard |
| **Backend REST API** | [http://localhost:5001/api](http://localhost:5001/api) | Express + Node.js Backend API |
| **API Healthcheck** | [http://localhost:5001/api/health](http://localhost:5001/api/health) | Server health status endpoint |

---

## 🔑 Login Accounts (Authentication Credentials)

> [!TIP]
> You can also click the **Fill Admin** or **Fill Worker** buttons on the login page UI to auto-fill these credentials instantly!

### 1. System Administrator (`admin`)
- **Username**: `admin` *(or email `admin@inventory.com`)*
- **Password**: `admin123`
- **Role**: `admin`
- **Permissions**: Full privileges — View Dashboard, Item Master, Add/Edit items, Adjust stock levels, Export CSV reports, and Delete inventory items.

### 2. Warehouse Worker (`worker`)
- **Username**: `worker` *(or email `worker@inventory.com`)*
- **Password**: `worker123`
- **Role**: `worker`
- **Permissions**: Operational access — View Dashboard, Item Master, Add/Edit items, Adjust stock levels, Export CSV reports. *(Delete item button is restricted for worker role)*.

---

## 🗄️ MongoDB Atlas Database Details

- **MongoDB URI**: `mongodb+srv://amarkp108:Amar9507@user.rsdmh.mongodb.net/Inventory?appName=User`
- **Database Name**: `Inventory`
- **Primary Items Collection**: `Inventory`
- **Users Collection**: `users`

---

## 🔐 Environment & Secret Keys

- **Backend Port**: `5001`
- **Frontend Port**: `3000`
- **JWT Secret Key**: `inventory_system_super_secret_jwt_key_2026`

---

## 🛠️ Project Execution Commands

Run from project root directory `/Users/amar/Desktop/Inventory system`:

```bash
# Launch both Backend Server and Frontend React App concurrently
npm start

# Run server only
cd server && npm start

# Run client only
cd client && npm run dev
```
