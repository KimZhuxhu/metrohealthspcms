# Metro Health System - Development Guide

## Project Overview

Metro Health System is a comprehensive Smart Patient Care Management System (SPCMS) built with modern web technologies. The system provides role-based access control for healthcare professionals and patients.

## ✅ Completed Features

### 1. **Authentication System (A)**
- ✅ Login page with email/password authentication
- ✅ AuthContext for state management
- ✅ ProtectedRoute component for route guarding
- ✅ Role-based access control (RBAC)
- ✅ Session persistence via localStorage
- ✅ Quick login buttons for demo purposes

### 2. **Core Infrastructure**
- ✅ TypeScript type definitions for all data models
- ✅ Mock data generator with realistic healthcare data
- ✅ localStorage-based API client with simulated network delays
- ✅ Comprehensive data models: UserProfile, PatientProfile, Provider, Appointment, Alert, VitalsTimeSeries, Rule, etc.

### 3. **UI Component Library**
- ✅ shadcn/ui components: Button, Card, Input, Label, Badge, Avatar
- ✅ Healthcare-specific color scheme (critical, warning, success, info)
- ✅ Tailwind CSS configuration
- ✅ Responsive design foundation

### 4. **Dashboard**
- ✅ Main dashboard with role-based quick links
- ✅ User profile display
- ✅ Activity overview cards
- ✅ Statistics display
- ✅ Navigation header with logout

### 5. **Routing**
- ✅ React Router v6 setup
- ✅ Protected routes
- ✅ Unauthorized and 404 pages
- ✅ Role-based route access

## 🚧 Features In Progress

The following features are scaffolded and ready for implementation:

### B. Appointment Scheduling System
- [ ] B1: Appointment List view with filtering
- [ ] B2: Appointment Booking form (multi-step)
- [ ] B3: Check-in workflow

### C. Patient Management System
- [ ] C1: Patient Profile view
- [ ] C2: Patient List with search/filter
- [ ] C3: Patient Admission form

### D. Vitals Monitoring & Alerts System
- [ ] D1: Vitals Entry form
- [ ] D2: Vitals Trending Charts (Recharts)
- [ ] D3: Alert Management System
- [ ] D4: Clinical Rules Engine UI

### E. Clinical Documentation
- [ ] E1: SOAP Notes interface
- [ ] E2: Nursing Notes timeline

### F. Nurse Dashboard & Workflow
- [ ] F1: Nurse Dashboard layout
- [ ] F2: Patient Assignment view
- [ ] F3: Medication Administration Record (MAR)

### G. Provider Dashboard
- [ ] G1: Provider Dashboard
- [ ] G2: Provider Schedule view
- [ ] G3: Patient Chart Review

### H. System Admin Dashboard
- [ ] H1: Admin Dashboard with analytics
- [ ] H2: User Management interface
- [ ] H3: System Configuration panel

## 🔐 Demo Credentials

All accounts use password: `password123`

| Role | Email | Description |
|------|-------|-------------|
| Admin | admin@metro.health | Full system access |
| Charge Nurse | charge.nurse@metro.health | ICU charge nurse with elevated permissions |
| Nurse | nurse.johnson@metro.health | ICU bedside nurse |
| Nurse | nurse.chen@metro.health | Medical-Surgical nurse |
| Provider | dr.smith@metro.health | Internal Medicine physician |
| Provider | dr.davis@metro.health | Cardiologist |
| Patient | patient1@metro.health | Patient portal access |
| Patient | patient2@metro.health | Patient portal access |

## 📊 Mock Data Available

- **5 Patients**: John Anderson, Mary Thompson, James Wilson, Patricia Martinez, Robert Garcia
- **2 Providers**: Dr. Robert Smith (Internal Medicine), Dr. Emily Davis (Cardiology)
- **4 Nurses**: Including charge nurse and bedside nurses
- **3 Appointments**: Various statuses (scheduled, checked-in, completed)
- **4 Active Alerts**: Different severity levels
- **24+ hours** of vitals data per patient
- **SIRS and EWS** clinical rules
- **Medications** and **Nursing Notes**

## 🛠 Technology Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite 6.0.3** - Build tool
- **React Router v6** - Navigation

### UI/Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Accessible primitives
- **Lucide React** - Icons

### Data Visualization
- **Recharts** - Charts for vitals trending

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation

### State Management
- **React Context** - Authentication & global state
- **localStorage** - Data persistence

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   └── avatar.tsx
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication state
├── lib/
│   ├── api.ts          # Mock API client
│   ├── mockData.ts     # Sample healthcare data
│   ├── utils.ts        # Utility functions
│   └── dateUtils.ts    # Date formatting
├── types/
│   └── index.ts        # TypeScript definitions
├── styles/
│   └── globals.css     # Tailwind + custom styles
├── App.tsx             # Main app with routing
└── main.tsx            # Entry point
```

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

The app will be available at `http://localhost:5180`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6) - Main brand color
- **Critical**: Red (#ef4444) - Critical alerts
- **Warning**: Orange (#f97316) - Warning states
- **Success**: Green (#22c55e) - Success states
- **Info**: Light Blue (#0ea5e9) - Informational

### Typography
- Font family: System fonts (San Francisco, Segoe UI, etc.)
- Scale: Tailwind default scale

### Spacing
- Base unit: 4px (Tailwind spacing)
- Border radius: 0.5rem (--radius)

## 🔒 Role-Based Access Control

### Roles Hierarchy
1. **Admin** - Full system access
2. **Charge Nurse** - Unit management + nurse capabilities
3. **Nurse** - Patient care, vitals, medications
4. **Provider** - Clinical decisions, orders, consultations
5. **Patient** - View own records, appointments

### Route Protection
Routes are protected using the `ProtectedRoute` component:
```tsx
<ProtectedRoute requiredRoles={['admin', 'nurse']}>
  <YourComponent />
</ProtectedRoute>
```

## 📝 API Client Usage

The mock API client mimics real API calls with network delays:

```typescript
import { patientApi, appointmentApi, authApi } from '@/lib/api';

// Login
const { success, data, error } = await authApi.login(email, password);

// Get patients
const response = await patientApi.getAll();

// Create appointment
const newAppt = await appointmentApi.create({
  patientId: 'P001',
  providerId: 'prov-001',
  // ...
});
```

## 🎯 Next Steps for Development

1. **Implement Patient List** - Searchable, filterable patient directory
2. **Vitals Dashboard** - Real-time vitals with Recharts visualization
3. **Alert System** - Real-time alerts with acknowledge/resolve workflow
4. **Appointment Scheduler** - Calendar view with booking workflow
5. **Clinical Notes** - SOAP notes and nursing documentation
6. **MAR** - Medication administration tracking
7. **Admin Tools** - User management, system configuration

## 🧪 Testing Users

Use the quick login buttons on the login page or manually enter credentials. All passwords are `password123`.

## 📖 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)

## 🤝 Contributing

When adding new features:
1. Create type definitions in `src/types/`
2. Add mock data in `src/lib/mockData.ts`
3. Create API methods in `src/lib/api.ts`
4. Build UI components in `src/components/`
5. Add routes in `src/App.tsx`

## 📄 License

MIT
