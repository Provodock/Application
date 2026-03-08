# Event Manager — Setup Guide

## Prerequisites

- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/)

> Node.js is **not** required — everything runs inside Docker containers.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Provodock/Application.git
cd event_manager
```

## 2. Configure Environment (Optional)

The project includes a `.env` file with default credentials. You can edit it if needed:

```env
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=event_manager
JWT_SECRET=dev_secret_key
VITE_API_BASE_URL=http://localhost:3000/api
```

> The defaults work out of the box — no changes are required for local development.

## 3. Start the Application

```bash
docker compose up --build
```

This single command starts three containers:

| Service              | URL                          |
|---------------------|-------------------------------|
| **Frontend**         | http://localhost:5173         |
| **Backend (Swagger)**| http://localhost:3000/api     |
| **PostgreSQL**       | localhost:5432               |

Wait until you see logs from all three services indicating they are ready.

## 4. Seed the Database

In a **separate terminal**, while the containers are running:

```bash
docker compose exec backend npm run seed
```

This creates demo data:

| Email               | Password      |
|---------------------|---------------|
| alice@example.com   | password123   |
| bob@example.com     | password456   |

It also creates 3 sample events.

## 5. Open the App

1. Navigate to **http://localhost:5173**
2. Click **Login** and sign in with one of the seeded accounts above
3. Explore the features:
   - **Public events** — browse all upcoming events (List / Calendar view) with Join / Leave buttons
   - **Create event** — create a new event with public or private visibility
   - **My events** — calendar view (Month / Week) of events you organize or participate in
   - **Event details** — view full details, join, leave, edit, or delete events
   - **Dark / Light theme** — toggle in the header

## 6. Stop the Application

```bash
docker compose down
```

To also remove the database volume (full reset):

```bash
docker compose down -v
```

---

## API Endpoints

| Method | Endpoint              | Action                         |
|--------|-----------------------|--------------------------------|
| POST   | /auth/register        | Register a new user            |
| POST   | /auth/login           | Login and receive JWT          |
| GET    | /events               | Fetch public events            |
| GET    | /events/:id           | Fetch single event details     |
| POST   | /events               | Create new event (auth)        |
| PATCH  | /events/:id           | Edit event (organizer only)    |
| DELETE | /events/:id           | Delete event (organizer only)  |
| POST   | /events/:id/join      | Join event (auth)              |
| POST   | /events/:id/leave     | Leave event (auth)             |
| GET    | /users/me/events      | Fetch user's events (auth)     |

Full interactive API documentation is available at **http://localhost:3000/api** (Swagger).

---

## Running Without Docker (Optional)

### PostgreSQL

Ensure a local PostgreSQL instance is running with the credentials from `.env`:

- **Database**: `event_manager`
- **User**: `postgres`
- **Password**: `postgres`
- **Host**: `localhost`
- **Port**: `5432`

### Backend

```bash
cd backend
npm install
npm run start:dev
```

Available at http://localhost:3000/api

Seed locally:

```bash
npm run seed
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Available at http://localhost:5173

> The frontend connects to the backend at `http://localhost:3000/api` by default.  
> Override with the `VITE_API_BASE_URL` environment variable if needed.

---

## Tech Stack

| Layer      | Technology                                       |
|-----------|---------------------------------------------------|
| Frontend  | React, TypeScript, Vite, Tailwind CSS, Zustand    |
| Backend   | NestJS, TypeScript, TypeORM, JWT, Swagger         |
| Database  | PostgreSQL                                         |
| DevOps    | Docker, Docker Compose                             |
