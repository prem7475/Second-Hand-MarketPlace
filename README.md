# Refind — Second-Hand Marketplace

Refind is a full-stack marketplace for discovering and passing along pre-loved
goods. It includes a responsive React/Tailwind client, an Express REST API,
MongoDB/Mongoose persistence, cookie-based JWT sessions, favorites, seller
listing management, and real-time buyer/seller conversations.

## Stack

- **Client:** React 18, Vite, Tailwind CSS 4, React Router, Socket.IO client
- **API:** Node.js 20+, Express, Zod, Helmet, rate limiting
- **Data:** MongoDB with Mongoose models and query-oriented indexes
- **Auth:** bcrypt password hashes, HTTP-only JWT session cookie, CSRF token
- **Delivery:** Docker Compose, GitHub Actions, Render/Netlify deployment notes

## Run locally

Prerequisites: Node.js 20+, npm, and Docker Desktop (or a locally running MongoDB).

1. Copy `server/.env.example` to `server/.env`.
2. Replace `JWT_SECRET` with a unique random value of at least 32 characters.
   The API, Vite dev server, Docker Compose, and local integration test load
   this shared environment file. The server directory's `.env` file is ignored
   by Git.
3. Start MongoDB locally, or use `docker compose up --build`.
4. Install dependencies with `npm install`.
5. Start the client and API with `npm run dev`.
6. Open <http://localhost:5173>.

The Vite server proxies `/api` and `/socket.io` to `http://localhost:4000`.
Use `npm run dev` when running MongoDB locally. Docker Compose starts MongoDB,
the API, and the Nginx client together at <http://localhost:8080>.
Compose configures the API to trust its single Nginx proxy so authentication
rate limiting can correctly identify client IPs. It also seeds the demo
catalog automatically when the API starts.

To add sample listings to a local database, run:

```powershell
$env:SEED_DEMO_DATA = "true"
npm run seed -w server
```

The seed command adds 56 listings (8 in each marketplace category). Each listing
includes a description, price, condition, location, and Unsplash image. Seeding
is idempotent. It creates an unloginable fixture seller and does not set a
default user password. Docker Compose seeds automatically. The Render Blueprint
also explicitly enables seeding for its configured production MongoDB; remove
`SEED_DEMO_DATA` and `ALLOW_DEMO_SEED` there to disable public demo listings.
The client also falls back to this same catalog for browsing if the API is
unavailable. Demo listings are browse-only until the API is restored.

## Environment

| Variable           | Service          | Purpose                                                       |
| ------------------ | ---------------- | ------------------------------------------------------------- |
| `MONGODB_URI`      | API              | MongoDB connection string                                     |
| `JWT_SECRET`       | API              | JWT signing secret; minimum 32 characters                     |
| `CLIENT_ORIGIN`    | API              | Allowed browser origin(s), comma-separated                    |
| `PORT`             | API              | API listen port (default `4000`)                              |
| `TRUST_PROXY`      | API              | Trust one reverse proxy when set to `true`                    |
| `VITE_API_URL`     | Client build     | Optional API origin for split frontend/API hosting            |
| `VITE_SOCKET_URL`  | Client build     | Socket.IO server origin; Netlify sets this to the Render API  |
| `TEST_API_URL`     | Local smoke test | Local app origin (defaults to `http://localhost:8080`)        |
| `TEST_MONGODB_URI` | Local smoke test | Local test database URI; should match the API's local MongoDB |

`server/.env` is the single local environment file. Put the complete MongoDB
connection string, including any required credentials, in `MONGODB_URI`; the
application does not consume separate MongoDB username/password variables.
The smoke test connects to `TEST_MONGODB_URI` to clean up its generated records.
Do not point that variable at production data.

Never commit `.env` files or production credentials. In Docker Compose the
client and API are served under one origin, and the Nginx container proxies API
and WebSocket requests to the API service.

## API overview

- `GET /api/health`
- `GET /api/auth/csrf`, `POST /api/auth/register`, `POST /api/auth/login`,
  `GET /api/auth/me`, `PATCH /api/auth/me`, `POST /api/auth/logout`
- `GET /api/listings`, `GET /api/listings/:id`, `GET /api/listings/mine`,
  `POST /api/listings`, `PATCH /api/listings/:id`, `DELETE /api/listings/:id`
- `GET /api/favorites`, `POST /api/favorites/:listingId`,
  `DELETE /api/favorites/:listingId`
- `GET /api/conversations`, `POST /api/conversations`,
  `GET /api/conversations/:id/messages`, `POST /api/conversations/:id/messages`

Authenticated requests use an HTTP-only JWT cookie and a CSRF token. The browser
client initializes the CSRF token automatically. The Postman collection is in
`postman/Refind Marketplace.postman_collection.json`.

### Listing query parameters

`q`, `category`, `condition`, `location`, `minPrice`, `maxPrice`, `sort`
(`newest`, `price-low`, `price-high`), `page`, and `limit` (maximum 24).

### WebSocket events

Authenticated clients can emit `conversation:join` with a conversation id and
`message:send` with `{ "conversationId": "...", "body": "..." }`. New messages
are delivered to authorized room members as `message:new`. Conversation
membership and payload validation are checked on the server.

## Quality checks

```powershell
npm test
npm run lint
npm run build
npm run format:check
```

The API validation and client formatting tests use Node's built-in test runner.
For full REST endpoint checks, import and run the Postman collection against a
local or deployed environment. The GitHub Actions workflow runs tests, lint,
and the client production build on pushes and pull requests.

### Postman and WebSocket testing

Import `postman/Refind Marketplace.postman_collection.json` into Postman and
run the requests in order. Register creates a fresh test account automatically.
To test conversations, create a listing under a second account, sign back in
with the first account, and set the collection variable `otherListingId` to the
second account's listing ID before running the conversation requests.

For a repeatable local Socket.IO test, start the API and MongoDB (for example,
with `docker compose up --build -d`), then run:

```powershell
npm run test:websocket
```

The smoke test uses temporary local-only test accounts and removes its users,
listing, conversation, and messages when finished. It verifies rejected
unauthenticated sockets, conversation membership, message delivery, and REST
history persistence. Set `TEST_API_URL` if the local app is not at
`http://localhost:8080`. The Compose MongoDB port is bound to loopback so the
test can clean its temporary data. Compose exposes MongoDB on `127.0.0.1:27018`
to avoid conflicting with a MongoDB server already using the default port.

## Deploy

### Docker

```powershell
Copy-Item server/.env.example server/.env
# Replace JWT_SECRET and set MONGODB_URI in server/.env before starting.
docker compose up --build
```

Open <http://localhost:8080>. Compose keeps MongoDB data in the named
`mongo-data` volume. Do not use the development credentials or sample data for
a production deployment; provide a managed MongoDB URI and secure secrets.

Stop the services with `docker compose down`. To reset local MongoDB data as
well, run `docker compose down --volumes`; this permanently removes the
`mongo-data` volume and all data stored in it.

### Render API + Netlify client

1. Create a MongoDB Atlas database and database user. Add the Render service's
   outbound access as required by your Atlas network-access rules.
2. In Render, create a **Web Service** from the repository (or deploy
   `render.yaml` as a Blueprint). Use the repository root as the service root,
   `npm install` as the build command, and `npm run start -w server` as the
   start command. Health check path: `/api/health`.
3. In the Render service's Environment settings, set `MONGODB_URI` to the
   Atlas connection string and ensure `CLIENT_ORIGIN` matches the Netlify site
   origin (`https://refind-olx.netlify.app` in the checked-in Blueprint).
   Ensure `NODE_ENV=production`. Generate a new, unique `JWT_SECRET` in Render
   (at least 32 random characters); never reuse or upload the local `.env`
   secret. The Blueprint enables idempotent demo seeding with
   `SEED_DEMO_DATA=true` and `ALLOW_DEMO_SEED=true`; after the first successful
   API startup, verify there are 8 listings in each of the 7 categories.
4. In Netlify, choose **Add new site → Import an existing project** and connect
   the repository. Keep the base directory at the repository root. The checked-in
   `netlify.toml` configures the build command and `client/dist` publish folder.
5. The checked-in `netlify.toml` proxies `/api/*` to
   `https://refind-api.onrender.com/api/*` before the client-side route
   fallback and sets `VITE_SOCKET_URL` to the Render API origin for real-time
   conversations. If your Render service has a different hostname, update both
   values and redeploy the frontend. Remove any stale `VITE_API_URL` override
   from Netlify so REST API calls use the same-origin proxy.
6. If you use a custom Netlify domain, update `CLIENT_ORIGIN` in `render.yaml`
   to that exact origin (including `https://` and any `www` subdomain), then
   apply the Blueprint change and redeploy the API.
7. Verify `https://refind-api.onrender.com/api/health` returns JSON with
   `{"status":"ok","service":"refind-api"}` before testing the Netlify proxy,
   account registration, listing creation, favorites, and real-time messaging
   from the deployed site. A `405` or `404` response means the Render service
   is not running this repository's API routes; verify its repository, branch,
   root directory, and start command (`npm run start -w server`) in Render.
   Render production cookies use `Secure` and `SameSite=None`; use a frontend
   and API custom domain on the same parent domain where possible because
   browsers may restrict cross-site cookies between separate Netlify and
   Render domains.

The Netlify rewrite in `netlify.toml` serves the client-side router. Production
MongoDB, hosting credentials, and domain verification are configured in the
provider dashboards, not committed to the repository.

## Project plan

See [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) for the phased implementation
checklist and the status of work completed in this repository.
