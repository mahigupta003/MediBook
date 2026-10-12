# MediBook

MediBook is a doctor appointment booking application with a React + Vite frontend and a Spring Boot REST API backed by MySQL.

## Features

- Browse doctors and their specializations and consultation fees
- Book appointments
- View appointment details and human-readable appointment date/time
- Reschedule or cancel eligible appointments
- Backend validation for appointment lifecycle rules
- Seeds three sample doctors on backend startup

## Requirements

- Java 17 or newer
- MySQL 8
- Node.js and npm

## Run the backend

1. Create the database in MySQL: `CREATE DATABASE medibook;`
2. In PowerShell, from the `backend` folder, set the database connection values for your machine:

   ```powershell
   $env:DB_URL = 'jdbc:mysql://localhost:3306/medibook'
   $env:DB_USERNAME = 'root'
   $env:DB_PASSWORD = Read-Host 'MySQL password'
   .\mvnw.cmd spring-boot:run
   ```

The API runs at `http://localhost:8080`.

## Run the frontend

In a second terminal, from the `frontend` folder:

```powershell
npm install
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

## Configuration

Do not commit database passwords or other credentials. The backend reads its password from `DB_PASSWORD`; configure local values in your shell or a private, ignored environment file.

## Free demo deployment notes

For a no-paid-plan demo, the frontend and backend can be hosted as Render Static Site and Web Service, with a free TiDB Cloud Starter database. TiDB Starter speaks the MySQL protocol, so the existing MySQL JDBC driver can connect to it. Set TiDB's free-instance monthly spending limit to `0`; when its free quota is reached, database connections are throttled until the quota resets. See [TiDB's free quota and limits](https://docs.pingcap.com/tidbcloud/serverless-limitations/) and [MySQL compatibility](https://docs.pingcap.com/tidbcloud/mysql-compatibility/).

Render's free backend sleeps after 15 minutes without requests; its next request can take about a minute to wake up. Render's free PostgreSQL database expires after 30 days, so this project uses TiDB for persistent demo data instead. See [Render free instance limits](https://render.com/docs/free).

The GitHub upload currently keeps these files under `MediBook-GitHub/`. In Render, set the service root directories to `MediBook-GitHub/frontend` and `MediBook-GitHub/backend` respectively.

### Render frontend (Static Site)

- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_BASE_URL` = the public backend URL, without a trailing slash

### Render backend (Web Service)

- Select Docker as the runtime. The included `backend/Dockerfile` builds and runs the Java 21 Spring Boot app.
- Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `APP_CORS_ALLOWED_ORIGIN` in the service's environment settings. Use the JDBC URL, username, and password shown by TiDB's connection page; set `APP_CORS_ALLOWED_ORIGIN` to the deployed frontend URL. Never put these secret values in GitHub.
- The app reads Render's `PORT` variable automatically.

After changing deployment settings, trigger a new deploy for each service.
