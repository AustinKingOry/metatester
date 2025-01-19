# Website Metadata Fetcher

This project is a web application that allows users to fetch and display metadata from any website URL they input. It consists of a Node.js backend and a React frontend built with Vite.

## Backend

The backend is a simple Node.js server that provides a REST API for fetching website metadata.

### Setup

1. Navigate to the backend directory.
2. Run `npm install` to install dependencies.
3. Start the server with `npm start`.

The server will run on `http://localhost:3001`.

### API

The backend exposes two endpoints:

- `POST /fetch-metadata`
  - Accepts a JSON object with a `url` field in the request body.
  - Returns a JSON object containing the metadata (title, description, image, favicon).
- `DELETE /clear-cache`
  - Clears the server's metadata cache.
  - Returns a success message.

## Frontend

The frontend is a React application built with Vite that provides a user interface for inputting URLs and displaying the fetched metadata.

### Setup

1. Navigate to the frontend directory.
2. Run `npm install` to install dependencies.
3. Start the development server with `npm run dev`.

The frontend will be available at `http://localhost:5173` by default.

## Usage

1. Enter a valid URL in the input field.
2. Click the "Fetch Metadata" button or press Enter to fetch the metadata.
3. The metadata will be displayed in a card below the input field.
4. Use the "Clear" button to reset the form.
5. Use the trash icon button to clear the server's cache and fetch fresh metadata.

## Dependencies

- Backend:
  - Node.js
  - cheerio (for HTML parsing)
- Frontend:
  - React
  - TypeScript
  - Vite
  - Tailwind CSS (for styling)
  - lodash (for debouncing)

## Configuration

- The backend server port is hardcoded to 3001.
- The frontend API URL is hardcoded to `http://localhost:3001/fetch-metadata`.

To change these values, update the `PORT` constant in `server.js` and the `API_URL` constant in `src/App.tsx` respectively.

## Building for Production

To build the frontend for production:

1. Run `npm run build` in the frontend directory.
2. The built files will be in the `dist` directory.

You can preview the production build locally by running `npm run preview`.

