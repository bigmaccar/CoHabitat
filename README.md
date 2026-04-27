## CoHabitat

CoHabitat is a full-stack apartment and roommate management app utilizing the MERN stack.

### Prerequisites

Please ensure the following is installed

- Node.js
- npm
- A MongoDB database

### Project Setup

Application structure

- client: React web app
- server: Express API

Set-up Instructions

```bash
cd client
npm install
cd ../server
npm install
```

Connecting your own MongoDB

Create server/.env containing:

```utf-8
MONGO_URL=your_mongodb_connection_string
```

Running the app

Start the backend first:

```bash
cd server
node index.js
```

Start the front end from a new terminal:

```bash
cd client
npm start
```

Frontend runs on [http://localhost:3000]

Backend runs on [http://localhost:7000]
