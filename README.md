# Journey

## About

Journey is a single-page app for creating trip itineraries for groups in real time and browsing public itineraries for inspiration. This is a updated version of the original project, with modernized dependencies, improved build and session management, and deployment to Render for backend and frontend services.

## Tech Stack

- Front-end: React, Vite (for development and build), TailwindCSS, Socket.io-client (for real-time collaboration), React Router (for navigation), React-to-Print (for printing itineraries), Axios (for API requests), and Storybook (for component development and testing). Wire-framed on Figma.
- Back-end: Express (web framework), Node.js (runtime), PostgreSQL (database), Socket.io (for real-time features), express-session (for session management), bcrypt (for password hashing), helmet (for security headers), and Axios (for API requests).

## Final Product

![home](docs/home.png?raw=true 'Home Page')
![explore](docs/explore.png)
![activity search](docs/activity-search.png)
![overview](docs/overview.png)
![print](docs/print.png)

## Getting Started 

### See it in production!
1. Visit https://journey-ncho.onrender.com
Note: It could take a few minutes for the server/ backend to wake up.

### Development Mode
1. Clone the repository and navigate to the project directory.
2. Create the `.env` by using `.env.example` as a reference

- Sign up at Open Trip Maps (https://dev.opentripmap.org/register), add API key to .env
- Set up PostgreSQL either locally or online and enter the respective variable/s to the .env
  
3. Install dependencies:

   - **Backend:**  
     ```bash
     cd backend && npm i
     ```
   
   - **Frontend:**  
     ```bash
     cd client && npm i
     ```

4. Reset the database (using Node v10.20.x or compatible):  
   ```bash
   cd backend && npm run db:reset
   ```
5. Start the backend server:  
   ```bash
   cd backend && npm start
   ```
6. Start the frontend server:
   ```bash
   cd client && npm run dev
   ```
7. Visit http://localhost:5173/ (default Vite port; check console for exact URL).

## Tips

- Use the `npm run db:reset` command each time there is a change to the database schema or seeds.
  - Note: in doing this, you will lose any newly created data (not in seed files), as the schema will tend to `DROP` the tables and recreate them.

## Main Dependencies

### Client

- Node (18.x+) for React and Vite
- axios (1.7.x)
- emailjs-com (3.2.x)
- react (18.2.x)
- react-dom (18.2.x)
- react-router-dom (6.24.x)
- react-to-print (2.15.x)
- socket.io-client (4.7.x)
- web-vitals (4.2.x)

> Dev dependencies include TailwindCSS plugins, Storybook addons, testing libraries (e.g., @testing-library/react), Vite plugins, ESLint, and PostCSS.

### Back-end Server

- Node (18.x+) for Express  
- axios (1.6.x)  
- bcrypt (5.1.x)  
- chalk (5.5.x)  
- cors (2.8.x)  
- debug (4.3.x)  
- dotenv (17.2.x)  
- express (4.19.x)  
- express-session (1.18.x)  
- helmet (7.0.x)  
- morgan (1.10.x)  
- pg (8.11.x)  
- socket.io (4.7.x)  

> Dev dependencies include nodemon (3.1.x) for development.

## External APIs

- Open Trip Maps
- Open Meteo - Geocoding
- Nominatum
