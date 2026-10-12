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
