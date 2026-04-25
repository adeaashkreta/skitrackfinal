# skitrackfinal

## Backend setup

### Folder structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    repositories/
    routes/
    services/
    utils/
    app.js
    server.js
```

### Requirements

- Node.js
- npm
- MySQL Server
- MySQL Workbench
- MongoDB Community Server or MongoDB Atlas

### Install dependencies

```powershell
cd backend
npm install
```

### Create the MySQL database

Open MySQL Workbench and connect to your local MySQL server.

Run this SQL:

```sql
CREATE DATABASE skitrack;
```

### Set up MongoDB

For local MongoDB, make sure MongoDB is installed and running.

The backend uses this local MongoDB URL by default:

```env
MONGO_URL=mongodb://localhost:27017/skitrack
```

MongoDB creates the `skitrack` database automatically the first time the app writes data to it.

If using MongoDB Atlas, replace `MONGO_URL` with your Atlas connection string:

```env
MONGO_URL=mongodb+srv://USER:PASSWORD@CLUSTER_URL/skitrack
```

### Environment variables

Create a `.env` file inside `backend/`.

You can copy the example:

```powershell
Copy-Item .env.example .env
```

Then update the values in `backend/.env`:

```env
PORT=5173
JWT_SECRET=yourSuperSecretKey
DATABASE_URL=mysql://root:your-password@localhost:3306/skitrack
MONGO_URL=mongodb://localhost:27017/skitrack
```

### Run the backend

For development:

```powershell
npm run dev
```

For production/start mode:

```powershell
npm start
```

The backend should run on:

```text
http://localhost:5173
```

Health check:

```text
http://localhost:5173/health
```
