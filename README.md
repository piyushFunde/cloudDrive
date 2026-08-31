# ☁️ CloudDrive — Cloud-Based File Storage Service

A production-quality, Google Drive-inspired cloud file storage and sharing web application built with **Java Spring Boot** and **React**.

---

## ✨ Features

- 🔐 JWT Authentication + Google OAuth (Phase 2)
- 📁 Nested folder management
- 📤 Presigned URL file uploads (direct-to-storage)
- 🔗 File sharing with roles (Viewer / Editor)
- 🌐 Public share links with expiry & optional password
- ⭐ Starred files
- 🗑️ Trash & restore (soft delete)
- 🔍 Full-text search with filters
- 📊 Storage usage tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand + TanStack Query v5 |
| Backend | Spring Boot 3.3 (Java 17) |
| Security | Spring Security + JWT (JJWT 0.12.6) |
| Database | PostgreSQL 16 |
| Storage | AWS S3 (or local filesystem for dev) |
| API Docs | SpringDoc OpenAPI (Swagger UI) |

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven 3.8+

### 1. Start the Database
```bash
docker-compose up -d
```

### 2. Run the Backend
```bash
cd backend
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

> **Dev mode** uses H2 in-memory database by default (no PostgreSQL needed).  
> To use PostgreSQL: `mvn spring-boot:run -Dspring.profiles.active=prod`

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## ⚙️ Configuration

### Backend — `backend/src/main/resources/application.yml`

Key environment variables for production (`prod` profile):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | DB username |
| `DATABASE_PASSWORD` | DB password |
| `JWT_SECRET` | 256-bit JWT signing secret |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret |
| `AWS_S3_BUCKET` | S3 bucket name |
| `AWS_REGION` | AWS region (e.g. `us-east-1`) |

### Frontend — `frontend/.env.local`
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/files/init-upload` | Get presigned upload URL |
| POST | `/api/files/complete-upload` | Save file metadata |
| GET | `/api/files/{id}` | Get file details |
| DELETE | `/api/files/{id}` | Soft delete file |
| POST | `/api/folders` | Create folder |
| GET | `/api/folders/{id}/contents` | List folder contents |
| POST | `/api/shares` | Share with user |
| POST | `/api/public-links` | Create public link |
| GET | `/api/search` | Search files & folders |
| GET | `/api/trash` | List trashed items |

Full documentation available at `/swagger-ui.html` when backend is running.

---

## 🏗️ Project Structure

```
CloudDrive/
├── docker-compose.yml
├── backend/          # Spring Boot API
└── frontend/         # React + Vite SPA
```

---

## 📋 Development Roadmap

### MVP (Current)
- [x] Auth (JWT)
- [x] File upload/download
- [x] Folder management
- [x] Sharing & permissions
- [x] Search
- [x] Trash

### Phase 2
- [ ] Google OAuth login
- [ ] File versioning
- [ ] PDF/Image preview
- [ ] Activity logs
- [ ] Storage quota & plans
- [ ] Desktop sync client

---

## 📄 License
MIT License — See [LICENSE](LICENSE)
