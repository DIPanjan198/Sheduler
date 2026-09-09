# Small Business Shift Scheduler & Tracker

A mobile-first full-stack shift scheduling, visual drag-and-drop calendar, time clock tracker, and time-off/swap approval system.

Built strictly according to:
- `01_SRS_Software_Requirements_Specification.md`
- `02_UI_UX_Design_Document.md`
- `03_Implementation_Stages_Roadmap.md`
- `04_Feature_Requirements_Checklist.md`

---

## Technical Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, JWT Authentication, Luxon timezone handling.
- **Frontend:** React (Vite + TypeScript), Tailwind CSS, Lucide icons, mobile-first responsive layout (bottom tabs on mobile < 640px, left sidebar on desktop ≥ 1024px).

---

## How to Run

### 1. Backend Server
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
The REST API server runs at `http://localhost:5000/api/v1`.

### 2. Frontend Client
```bash
cd frontend
npm install
npm run dev
```
The frontend web app runs at `http://localhost:3000`.

---

## Quick Demo Credentials

- **Manager Account:** `sarah@cafe.com` / `password123`
- **Employee Account:** `alex@cafe.com` / `password123`
