# Metro Health System - Smart Patient Care Management System (SPCMS)

A modern, role-based healthcare management system built with React 18, TypeScript, and Vite.

## Features

- **Role-Based Access Control**: Patient, Nurse, Provider, Charge Nurse, and Admin roles
- **Smart Patient Monitoring**: Real-time vitals tracking and alert management
- **Clinical Decision Support**: SIRS and EWS criteria-based alerting
- **Appointment Management**: Comprehensive scheduling and check-in workflows
- **Responsive Design**: Mobile-first, accessible UI with shadcn/ui components

## Tech Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 6.0.3
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Layout components (Header, Sidebar)
│   └── ...          # Feature components
├── contexts/        # React Context providers
│   └── AuthContext.tsx
├── lib/            # Utilities
│   ├── api.ts      # Mock API client
│   ├── mockData.ts # Sample data
│   └── utils.ts    # Helper functions
├── types/          # TypeScript definitions
├── styles/         # Global CSS
└── guidelines/     # Development docs
```

## Default Login Credentials

- **Admin**: admin@metro.health / password123
- **Charge Nurse**: charge.nurse@metro.health / password123
- **Nurse**: nurse.johnson@metro.health / password123
- **Provider**: dr.smith@metro.health / password123
- **Patient**: patient1@metro.health / password123

## License

MIT
