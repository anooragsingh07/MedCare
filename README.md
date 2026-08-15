# MedCare

MedCare is a **college dispensary** web application for managing student health services: patient visits, appointments, a free-care cost ledger, medicine inventory, and medical staff. Students get a UID-based login and can only view their own records; staff and admins manage the rest.

This repository is a learning and demonstration project.

## Features

- **Authentication & roles** — students, staff, and admin log in with a UID + password (JWT). Students see only their own records; staff/admin manage the dispensary; admin manages the student directory.
- **Student master directory** — admin imports or adds students (UID, name, department, year). UID auto-fills patient and dispensary forms, and unrecognized roll numbers are rejected when saving visits.
- **Patient registration** — structured prescriptions with medicines + dosage, prescription PDF download, and a **medical certificate PDF** for excusal from classes.
- **Free-care cost ledger** — no payment status. Every dispensary issue logs the items dispensed and the cost borne by the dispensary, with a voucher PDF.
- **Medicine inventory** — stock levels, unit cost, reorder levels, low-stock alerts, and automatic stock deduction when items are dispensed.
- **Appointments** — scheduling with status updates and doctor availability.
- **Reports & dashboard** — patient volume, dispensary cost trend by month, cost by department, top dispensed medicines, low-stock alerts, and recent activity.
- REST API backed by MongoDB with consistent JSON responses.

## Screenshots

The images below were captured from a running MedCare UI after [demo data](#demo-data-for-testing) was loaded.

| Dashboard | Patients |
| :---: | :---: |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Patients](docs/screenshots/patients.png) |

| Appointments | Dispensary |
| :---: | :---: |
| ![Appointments](docs/screenshots/appointments.png) | ![Dispensary](docs/screenshots/dispensary.png) |

| Inventory | Reports |
| :---: | :---: |
| ![Inventory](docs/screenshots/inventory.png) | ![Reports](docs/screenshots/reports.png) |

> Note: screenshots predate the authentication upgrade. Regenerate them with `npm run readme:screenshots` (see below) after logging in as `admin`.

### Regenerating screenshots

Point the capture script at any reachable URL (local Vite dev server, preview, or a deployed site):

```bash
cd client
npm install
npx playwright install chromium
cd server
npm run seed:demo
```

In one terminal, run the API (`cd server && npm run dev`) and the client (`cd client && npm run dev` or `npm run preview` after a build). Then:

```bash
cd client
# Default is http://localhost:5173 — override if Vite picked another port or you use production.
npm run readme:screenshots
```

Override the base URL when needed:

- **cmd.exe:** `set MEDCARE_SCREENSHOT_URL=http://localhost:5174`
- **PowerShell:** `$env:MEDCARE_SCREENSHOT_URL="https://your-live-site.example"`
- **macOS / Linux:** `export MEDCARE_SCREENSHOT_URL=https://your-live-site.example`

Files are written to `docs/screenshots/`.

## Architecture

| Layer | Technology |
| --- | --- |
| Client | React 19, React Router 7, Vite 8, Tailwind CSS 4, React Hook Form, Zod, Axios, Recharts |
| Server | Node.js (ES modules), Express 4, Mongoose 8, JSON Web Tokens, bcryptjs |
| Database | MongoDB (local or MongoDB Atlas) |
| Documents | PDFKit for prescription, medical certificate, and dispensary voucher PDFs |

The Vite dev server proxies `/api` to the Express API during local development.

## Repository layout

```
MedCare/
├── client/          # React SPA (Vite)
├── server/          # Express API and PDF generation
├── docs/screenshots # README UI captures (regenerate with client npm script)
└── README.md
```

Example API payloads for manual testing live under `server/examples/`.

## Demo data for testing

A seed script loads **fictional** students, patients, appointments, dispensary entries, medicines, doctors, and login accounts so you can exercise every screen.

- **Safe default:** only rows tagged as demo are removed before insert — patients, appointments, and dispensary entries whose roll number starts with `DEMO-`, students with `DEMO-` UIDs, doctors whose name starts with `Demo `, and medicines from the demo list.
- **Destructive option:** `ALLOW_FULL_DB_RESET=yes npm run seed:demo -- --reset-all` deletes **all** data in the connected database (use only on a disposable database).

```bash
cd server
npm install
npm run seed:demo
```

Demo login accounts (UID / password):

| Role | UID | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Staff | `staff` | `staff123` |
| Student | `DEMO-CS23045` | `student123` |

After seeding, look for roll numbers such as `DEMO-CS23045`, `DEMO-EC23012`, and `DEMO-ME23008`. Log in as **admin** to register visits, record dispensary issues (stock is deducted automatically), and download prescription / certificate / voucher PDFs.

## Prerequisites

- Node.js 20 or newer recommended
- A MongoDB instance (local installation or Atlas cluster) and a connection URI

## Configuration

Copy `server/.env.example` to `server/.env` and set variables as needed.

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign login tokens (any long random string) |
| `PORT` | No | API port (default `5000`) |
| `CLIENT_ORIGIN` | No | Allowed browser origin for CORS in production (e.g. your deployed frontend URL) |
| `BILL_LOGO_PATH` | No | Absolute path to a PNG or JPEG used on PDFs; if unset, a vector mark is drawn |
| `MEDCARE_WEBSITE` | No | Shown on PDF footers |
| `MEDCARE_PHONE` | No | Shown on PDF footers |
| `MEDCARE_ADDRESS` | No | Shown on PDF footers |

Optional artwork can also be placed at `server/assets/bill-logo.png` if you prefer not to use `BILL_LOGO_PATH`.

## Local development

### API

```bash
cd server
npm install
npm run dev
```

The API listens on `http://localhost:5000` by default. Health check: `GET http://localhost:5000/api/health`.

If MongoDB is unreachable, the process still starts; data routes respond with service unavailable until the database connects.

### Client

```bash
cd client
npm install
npm run dev
```

The UI defaults to `http://localhost:5173` with `/api` proxied to port 5000.

### Production build (client only)

```bash
cd client
npm run build
npm run preview
```

Serving the built SPA from the same Express process is not configured in this repository; for production you typically deploy the static build to a CDN or static host and point it at your deployed API, or extend the server to serve `client/dist` and align CORS accordingly.

## HTTP API summary

Base path: `/api`. Resource routes require a `Authorization: Bearer <token>` header; `/api/auth/login` is public.

| Resource | Endpoints | Access |
| --- | --- | --- |
| Health | `GET /api/health` | Public |
| Auth | `POST /api/auth/login`; `GET /api/auth/me`; `PATCH /api/auth/password` | me/password: any logged-in user |
| Patients | `GET`, `POST /api/patients`; `GET`, `PATCH`, `DELETE /api/patients/:id`; `GET /api/patients/:id/prescription.pdf`; `GET /api/patients/:id/certificate.pdf` | GET: any logged-in (students scoped to own); write/PDF: staff, admin |
| Appointments | `GET`, `POST /api/appointments`; `PATCH /api/appointments/:id/status`; `DELETE /api/appointments/:id` | students scoped to own |
| Dispensary (bills) | `GET`, `POST /api/bills`; `GET /api/bills/:id`; `GET /api/bills/:id/pdf` | staff, admin |
| Students | `GET`, `POST /api/students`; `PATCH`, `DELETE /api/students/:id`; `POST /api/students/import`; `GET /api/students/lookup` | admin |
| Medicines | `GET`, `POST /api/medicines`; `PATCH`, `DELETE /api/medicines/:id`; `POST /api/medicines/:id/stock` | staff, admin |
| Doctors | `GET`, `POST /api/doctors` | any logged-in user |

Consult `server/examples/MedCare.postman_collection.json` for sample requests.