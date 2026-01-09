# 🇮🇩 PJUTS Monitoring System

**Illuminating the Archipelago, One Solar Light at a Time.**

---

In the vast expanse of Indonesia, from the bustling streets of Jakarta to the remote islands of the East, thousands of **Solar Public Street Lights (PJUTS)** stand as beacons of renewable energy directly serving the community. But with great scale comes a great challenge: **How do we ensure every single light remains operational?**

This project is the answer. It is a dedicated digital platform built for the **Ministry of Energy and Mineral Resources (Kementerian ESDM)** to monitor, manage, and maintain the nationwide network of solar street lights.

## 📖 The Story

Imagine manual reports lost in transit, uncertain maintenance schedules, and the difficulty of verifying repairs in remote locations. The **PJUTS Monitoring System** transforms this logistical nightmare into a streamlined, data-driven operation.

We empower **Field Staff** with a simple, mobile-friendly tool to submit real-time reports—complete with GPS-verified coordinates and high-resolution photos—directly from the installation site. Meanwhile, **Admins** in the control center get a bird's-eye view of the entire country's infrastructure through an interactive dashboard, allowing them to spot outages instantly and deploy resources where they are needed most.

It's not just a database; it is the nervous system of Indonesia's solar lighting infrastructure.

## ✨ Key Features

### For the Guardians on the Ground (Field Staff)
- **📍 Precision Reporting**: Submit reports tagged with GPS coordinates. The system automatically verifies that you are actually at the unit's location.
- **📸 Visual Proof**: Upload high-resolution evidence of repairs or issues, optimized automatically for fast transmission even in low-bandwidth areas.
- **⚡ Battery Health Checks**: Log voltage readings to predict failures before they happen.

### For the Command Center (Admins)
- **🗺️ Interactive Situation Room**: A geospatial map visualizing the status of every unit in real-time—green for operational, red for critical.
- **📊 Insightful Dashboards**: Aggregate data by province to identifying regional trends and maintenance hotspots.
- **🛡️ Secure Management**: Robust role-based access control ensures data integrity.

## 🛠️ Built With

We chose a stack that prioritizes **performance**, **reliability**, and **scale**:

- **Next.js 15 (App Router)**: For a fast, SEO-friendly, and modern frontend experience.
- **TypeScript & Zod**: Ensuring end-to-end type safety and robust data validation.
- **Prisma & PostgreSQL**: A powerful relational database to handle complex asset management.
- **Cloudflare R2**: Cost-effective, robust object storage for thousands of field reports.
- **Tailwind CSS**: Creating a beautiful, responsive interface that looks good on any device.

## 🚀 Getting Started

Ready to light up the development environment? Follow these steps to deploy the system locally.

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** database ready to accept connections.
- **Cloudflare R2** bucket (or S3-compatible storage) for image handling.

### 1. Installation

Clone the repository and install the dependencies to get the grid online:

```bash
git clone https://github.com/your-org/pjuts-esdm.git
cd pjuts-esdm
npm install
```

### 2. Configuration

Create your local environment configuration. Make sure to fill in your specific database and storage credentials.

```bash
cp env.example.txt .env
```
> **Pro Tip**: Update the `DATABASE_URL` and R2 credentials in your new `.env` file before proceeding.

### 3. Database Initialization

Wake up the database and plant the initial seed data.

```bash
# Generate the Prisma client
npm run db:generate

# Push the schema to your local database
npm run db:push

# Seed the database with initial admin/staff accounts and demo units
npm run db:seed
```

> **Note**: The seed script will generate default admin and field staff accounts. Check the `prisma/seed.ts` file or your `.env` configuration to set their initial passwords.

### 4. Ignite the Engine

Launch the development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000` to access the command center.

## 🤝 Contributing

We welcome contributions to help keep the lights on! Whether it's optimizing the query performance or polishing the UI for field staff usage, feel free to open a Pull Request.

## ⚖️ License

Developed for **Kementerian ESDM Republik Indonesia**. Example proprietary/private license.
