# How This Website Works

This guide explains the Refind second-hand marketplace in everyday language.
It is written for someone who is learning web development, so it explains the
big words instead of assuming you already know them.

## 1. The big picture

Refind is a **full-stack website**. "Full-stack" means it has both:

- A **frontend**: the pages and buttons people see and use in their browser.
- A **backend**: the server that checks requests, signs users in, and talks to
  the database.

The database remembers users, listings, favorites, conversations, and messages.
The frontend and backend usually run as separate programs, even though they
work together as one website.

```text
Your browser
    |
    | React pages ask for data using HTTP, or connect for live chat
    v
Netlify frontend ---------------------> Render API
                                             |
                                             | Mongoose reads/writes
                                             v
                                        MongoDB database
```

When the frontend and API are running locally, their addresses are usually:

- Frontend: `http://localhost:5173` when using Vite.
- API: `http://localhost:4000`.
- Docker website: `http://localhost:8080`.

The checked-in production setup hosts the frontend on Netlify and the API on
Render. MongoDB can be hosted by MongoDB Atlas.

## 2. The languages and file types

### JavaScript

Most of the app is written in **JavaScript**. JavaScript gives instructions to
the browser or server. The `.js` extension usually means JavaScript code.

JavaScript has basic value types:

| Type | What it means | Example in this project |
| --- | --- | --- |
| String | Text | A listing title, email, category, or message |
| Number | A number, including decimals | A listing price |
| Boolean | `true` or `false` | Whether a request succeeded |
| Array | An ordered list of values | `images`, `members`, or listing results |
| Object | A group of named values | A user, listing, or API response |
| `null` | Intentionally no value yet | A page before its listing has loaded |
| `undefined` | A value has not been provided | An optional search parameter |

This repository uses JavaScript rather than TypeScript. That means the files do
not have TypeScript declarations such as `string` or `number` beside every
variable. The server still checks important data at runtime with **Zod**
schemas and **Mongoose** schemas. Think of those schemas as forms with rules:
they reject data that does not fit.

### JSX

Files ending in `.jsx` contain JavaScript plus **JSX**. JSX lets React describe
the page using tag-like syntax:

```jsx
<h1>Good things, found again.</h1>
```

It looks like HTML, but it is written inside JavaScript and turned into browser
instructions by the build tools.

### JSON

**JSON** is a common way for the frontend and backend to exchange data. It
looks like a JavaScript object, but is sent as text:

```json
{
  "title": "Lakdi ki kursi",
  "price": 1200,
  "category": "Furniture"
}
```

The API mostly sends JSON responses. The browser turns those responses back
into JavaScript objects.

## 3. React: building the pages

**React** is the library used to build the frontend. A React page is made from
small reusable pieces called **components**. For example, the same listing-card
component can appear on the home page, Explore page, and saved-items page.

The website's main pages live in `client/src/pages/`:

| Page | What it does |
| --- | --- |
| Home | Welcomes visitors and shows featured listings and categories |
| Browse | Searches, filters, sorts, and paginates listings |
| Listing detail | Shows one listing and lets a signed-in buyer contact its seller |
| Sign in / Register | Creates an account or starts a session |
| Sell | Creates or edits a listing |
| Profile | Shows account details and the user's own listings |
| Saved | Shows listings the user has favorited |
| Inbox | Shows conversations and lets their members chat |

Shared pieces such as the header, footer, loading indicator, and listing card
live in `client/src/components/`. `client/src/App.jsx` connects page components
to URLs, and `client/src/main.jsx` starts the React application.

### React hooks (the `use...` tools)

Hooks are functions React provides to let a component remember information or
react to changes. They are called at the top level of a component.

- **`useState`** remembers a value that can change. Examples: the current search
  text, whether a page is loading, and which messages are visible. Changing
  state tells React to draw the affected part again.
- **`useEffect`** runs work after React displays a page. This is useful for
  loading data, connecting a socket, or setting up a browser action. If an
  effect starts something that must be stopped, it can return a cleanup
  function. For example, the Inbox disconnects its socket when you leave a
  conversation.
- **`useRef`** remembers a value without redrawing the page each time it
  changes. Inbox uses refs to keep the current socket and to scroll to the
  bottom of the message thread.
- **`useCallback`** remembers a function between renders when that helps avoid
  recreating it unnecessarily. Inbox uses it for its message-submit function.
- **`useMemo`** remembers a calculated value until its inputs change. The
  authentication context uses it to prepare the value shared with child pages.
- **`useContext`** reads a value shared by a parent component. Refind's auth
  context shares the signed-in user and sign-in/sign-out functions.
- **`useParams`**, **`useLocation`**, **`useNavigate`**, and
  **`useSearchParams`** come from React Router. They read route information,
  navigate to another page, and work with query-string filters such as
  `/browse?category=Furniture`.

### Context and routes

**React Router** makes the URL choose which page to display. For example,
`/browse` shows Explore, while `/listing/abc123` shows a listing with that ID.

The **AuthContext** is shared account information. It helps many pages answer
questions like "Is someone signed in?" without passing that information
through every component by hand.

**Protected routes** wrap pages such as Sell, Profile, Saved, and Inbox. A
visitor who is not signed in is sent to sign in before opening those pages.
This frontend protection makes the experience clearer; the API also checks
permissions, because browser checks alone are not security.

### Vite and styles

**Vite** is the frontend development server and build tool. While developing,
it quickly serves the React app and proxies API requests to the local server.
When publishing, Vite turns the source files into optimized files in
`client/dist/`.

The project uses Tailwind CSS tooling and CSS files for appearance. CSS is the
language that controls colors, spacing, layout, fonts, and how the pages adapt
to small screens.

## 4. The backend: API and server

The backend uses **Node.js**, which lets JavaScript run outside the browser,
and **Express**, a framework for making web servers and API routes.

An **API** is a set of agreed-upon doors into the server. The browser asks for a
specific route, and the server responds with data or an error. Refind's routes
are grouped in `server/src/routes/`:

| Route group | Example paths | Purpose |
| --- | --- | --- |
| Authentication | `/api/auth/login`, `/api/auth/register` | Sign in, register, manage session |
| Listings | `/api/listings`, `/api/listings/:id` | Find, create, change, and remove listings |
| Favorites | `/api/favorites` | Save or unsave listings |
| Conversations | `/api/conversations/:id/messages` | Load and send chat history |
| Health | `/api/health` | Lets a host check that the API is running |

The colon in `:id` means "a value goes here." For example,
`/api/listings/abc123` asks about one listing.

Here are the main API doors in more detail:

| Method and path | What it does |
| --- | --- |
| `GET /api/health` | Says whether the API is running |
| `GET /api/auth/csrf` | Gives the browser a CSRF token |
| `POST /api/auth/register` | Creates an account |
| `POST /api/auth/login` | Signs in |
| `GET /api/auth/me` | Returns the current signed-in user's details |
| `PATCH /api/auth/me` | Updates the user's name or location |
| `POST /api/auth/logout` | Clears the browser's session cookie |
| `POST /api/auth/socket-token` | Creates a short-lived token for chat sockets |
| `GET /api/listings` | Searches and filters listings |
| `GET /api/listings/:id` | Reads one listing |
| `GET /api/listings/mine` | Lists the signed-in user's listings |
| `POST /api/listings` | Creates a listing |
| `PATCH /api/listings/:id` | Edits a listing or changes its status |
| `DELETE /api/listings/:id` | Removes one of the user's listings |
| `GET /api/favorites` | Lists the signed-in user's saved listings |
| `POST /api/favorites/:listingId` | Saves a listing |
| `DELETE /api/favorites/:listingId` | Removes a saved listing |
| `GET /api/conversations` | Lists the user's conversations |
| `POST /api/conversations` | Starts or finds a conversation about a listing |
| `GET /api/conversations/:id/messages` | Loads saved messages |
| `POST /api/conversations/:id/messages` | Sends a message using HTTP |

Most list endpoints answer with an object shaped like
`{ "items": [...], "pagination": {...} }`. A single listing is returned as
`{ "item": {...} }`. If a request does not succeed, the API usually answers
with a readable `message` and an HTTP status code, such as `400` for invalid
input or `401` when sign-in is needed.

### HTTP request types

The word "type" can also mean the kind of web request. Refind uses the common
HTTP methods:

- **GET** reads information, such as `GET /api/listings`.
- **POST** creates something or performs an action, such as registering an
  account.
- **PATCH** changes part of something, such as a listing's status.
- **DELETE** removes something, such as a favorite.

The frontend's `client/src/lib/api.js` helper sends these requests, includes
the browser's session cookies, handles JSON, and turns unsuccessful responses
into readable errors.

### Middleware

**Middleware** is server code that runs while a request travels toward its
route. It is like a checkpoint:

- Helmet adds browser security headers.
- CORS checks which websites are allowed to call the API directly.
- Cookie parsing makes browser cookies readable by server code.
- CSRF checking protects actions that change data.
- Authentication checks the session before private routes continue.
- Rate limiting slows down repeated attempts at sign-in.

The API is assembled in `server/src/app.js`. The HTTP and Socket.IO servers
start in `server/src/server.js`.

### Checking incoming data

The app uses **Zod** to check important incoming values before using them. A
listing price must be a valid non-negative number, for example; a chat message
must contain between 1 and 2,000 characters. If something does not fit the
rules, the server returns a helpful error instead of saving invalid data.

## 5. MongoDB and the shapes of the data

**MongoDB** is the database. It saves information as documents, which are
similar to JSON objects. **Mongoose** connects the Node.js server to MongoDB
and defines the shape and rules of those documents.

MongoDB gives each saved document an ID, usually shown as `_id`. Related
documents can refer to one another by ID. For example, a listing's `seller`
refers to a user.

### User

A user document contains:

- `name`: the person's display name.
- `email`: their unique, lower-case email address.
- `passwordHash`: a protected password hash; the raw password is never stored.
- `role`: either `user` or `admin`.
- `location`: optional profile location text.
- `createdAt` and `updatedAt`: dates managed by Mongoose.

### Listing

A listing document contains:

- `title` and `description`: text describing the item.
- `price`: a number. Refind displays it in Indian rupees (₹).
- `category`: one of `Furniture`, `Electronics`, `Fashion`, `Home & Living`,
  `Sports`, `Books`, or `Other`.
- `condition`: one of `Like new`, `Excellent`, `Good`, or `Fair`.
- `location`: the item's location.
- `images`: a list of image URLs.
- `status`: `active` or `sold`.
- `seller`: the ID of the user who posted it.
- `createdAt` and `updatedAt`: saved dates.

Indexes are like an index at the back of a book: they help MongoDB find
matching listings faster. This project indexes common searches such as category
and status, price, and listing text.

### Favorite

A favorite joins a user to a listing:

- `user`: the person who saved the item.
- `listing`: the item they saved.

The database prevents the same user from favoriting the same listing twice.

### Conversation

A conversation stores:

- `listing`: the item the conversation is about.
- `members`: the user IDs allowed to read and send messages.
- `participantsKey`: a stable key used to avoid duplicate conversations for
  the same listing and pair of people.
- `lastMessage` and `lastMessageAt`: a preview and date for the inbox.

### Message

A message stores:

- `conversation`: the conversation it belongs to.
- `sender`: the user who sent it.
- `body`: the message text.
- `createdAt` and `updatedAt`: saved dates.

The full field rules are defined in the Mongoose models under
`server/src/models/`, and the request rules are in
`server/src/lib/validation.js`.

## 6. Login and account safety

When a user registers, the server uses **bcrypt** to turn their password into a
one-way password hash before saving it. When they sign in, bcrypt checks the
entered password against that hash. The original password is not recoverable
from the hash.

After sign-in, the server creates a **JWT** (JSON Web Token). A JWT is a signed
note that says who the user is and when the session expires. Refind puts the
session token in an **HTTP-only cookie**, so normal page JavaScript cannot read
it.

For actions that change data, the browser also sends a **CSRF token**. This
helps prove that the action came from the real website and not from an
unwanted page trying to use the browser's saved login.

Chat sockets use a separate, short-lived token. The signed-in browser asks
`POST /api/auth/socket-token` for it, then sends it when connecting to the
Socket.IO server. The token expires after one minute. The server checks that
the user exists and checks conversation membership before letting a socket
join a private room.

Secrets such as `JWT_SECRET` and the MongoDB connection string belong in the
host's private environment settings or a local ignored `.env` file. They
should never be placed in frontend code or committed to Git.

## 7. WebSocket and live chat

With an ordinary **HTTP request**, the browser asks a question and gets an
answer. The connection can then end. This works well for loading a page or
searching listings.

A **WebSocket** keeps a two-way connection open. The browser and server can
send updates to each other right away. It is useful for chat because a new
message can appear without repeatedly refreshing the conversation.

Refind uses **Socket.IO**, a library that manages connections and message
events. It prefers the WebSocket transport and can fall back to HTTP polling
when an environment cannot use WebSockets.

The chat flow is:

1. The signed-in browser requests a short-lived socket token from the API.
2. The browser connects to the Socket.IO server with that token.
3. It emits `conversation:join` with a conversation ID.
4. The server checks that the signed-in user is a member, then joins that
   private room.
5. The browser emits `message:send` with a conversation ID and message body.
6. The server validates and saves the message, then sends `message:new` to
   sockets in that conversation room.
7. The sender receives an acknowledgement, and the message also appears in
   ordinary REST history.

If live messaging is temporarily unavailable, the app can still send a message
using the normal HTTP API.

## 8. Demo listings and seed data

The sample listings live in `shared/seed-data.mjs`. The same source is used by
the server's database seeding and by the browser's demo fallback, so the sample
catalog can still appear if the API is temporarily unavailable.

The seed script inserts sample documents into MongoDB. It is **idempotent**:
running it again updates or reuses its known sample entries rather than
creating a fresh duplicate set each time. Production seeding is guarded by
explicit settings so it does not happen accidentally.

The browser fallback is for browsing. It does not make a fake listing a real
database listing or allow chat with a sample seller.

## 9. Docker: packages for running the app

**Docker** packages a program together with the instructions and pieces it
needs to run. That package is called an **image**. A running copy of an image
is called a **container**.

The project has separate Dockerfiles:

- `server/Dockerfile` builds the Node.js API image.
- `client/Dockerfile` builds the frontend, then copies the built files into an
  Nginx web-server image.

**Docker Compose** is a helper for running several containers together. The
`docker-compose.yml` file starts:

1. MongoDB, with its data saved in a named volume.
2. The API, connected to MongoDB.
3. The Nginx frontend, which serves the web pages and forwards API and
   WebSocket traffic to the API container.

Start the local Docker setup with:

```powershell
docker compose up --build
```

The command builds images if needed and starts the containers. `--build`
rebuilds images after source or Dockerfile changes.

## 10. Deployment: putting the site on the internet

**Deployment** means publishing the app on computers that people can reach
over the internet.

### Netlify: frontend

Netlify builds the React frontend using Vite and publishes the files from
`client/dist/`. Its settings live in `netlify.toml`:

- Build command: `npm run build -w client`.
- Published folder: `client/dist`.
- `/api/*` requests are proxied to the Render API.
- The client is configured to connect to Render directly for Socket.IO, because
  the Netlify HTTP proxy does not carry WebSocket upgrades reliably.
- Other page URLs fall back to `index.html`, allowing React Router to display
  pages such as `/browse` when opened directly.

### Render: API

Render runs the Node.js API as a web service. `render.yaml` describes the
service name, branch, build/start commands, health check, and some environment
settings. The API connects to MongoDB using `MONGODB_URI`.

The `/api/health` route gives Render a simple way to check that the API has
started. A healthy API and a deployed frontend are separate things: both need
to be working for the complete website to work.

### MongoDB Atlas: hosted database

MongoDB Atlas can host the database online so the Render API can reach it. Its
connection string is configured privately as `MONGODB_URI`. Network access
rules must allow the Render service to connect.

### Important environment settings

| Setting | Used by | What it is for |
| --- | --- | --- |
| `MONGODB_URI` | API | Address and credentials for the MongoDB database |
| `JWT_SECRET` | API | Secret used to sign login and socket tokens |
| `CLIENT_ORIGIN` | API | Browser origin permitted for direct API requests |
| `PORT` | API | Port where the server listens |
| `TRUST_PROXY` | API | Tells Express it is behind a proxy such as Nginx |
| `VITE_API_URL` | Frontend build | Optional separate API address for normal HTTP requests |
| `VITE_SOCKET_URL` | Frontend build | Socket.IO server address |
| `SEED_DEMO_DATA` | API | Explicitly enables adding sample listings |
| `ALLOW_DEMO_SEED` | Production API | Additional explicit permission for production seeding |

`VITE_` settings are included in frontend build files. They are for public
configuration, never for passwords or secret keys.

## 11. CI/CD: automatic checks and deployments

**CI** means Continuous Integration. It automatically checks changes so
problems are more likely to be caught before they reach users.

**CD** means Continuous Delivery or Deployment. It describes automatically
getting approved changes ready for, or onto, a live service.

The GitHub Actions workflow in `.github/workflows/ci.yml` is the project's CI
pipeline. A **pipeline** is just a list of automated steps. On pushes to
`main`, pull requests, or a manual run, it:

1. Downloads the repository code.
2. Sets up Node.js 20 and npm's dependency cache.
3. Installs the exact dependencies from `package-lock.json` with `npm ci`.
4. Runs tests with `npm test`.
5. Checks code with `npm run lint`.
6. Checks formatting with `npm run format:check`.
7. Builds the frontend with `npm run build`.

If a required step fails, the workflow is marked as failed. This CI workflow
checks the code; Render and Netlify separately use their deployment settings
to build and publish the API and frontend when changes reach the configured
branch.

## 12. Tests and useful commands

Run these commands from the repository root:

| Command | What it does |
| --- | --- |
| `npm install` | Installs dependencies for the workspaces |
| `npm run dev` | Starts the local API and Vite frontend together |
| `npm test` | Runs the server and browser-side unit tests |
| `npm run lint` | Looks for common code mistakes and style issues |
| `npm run format:check` | Checks whether files follow Prettier formatting |
| `npm run build` | Creates the production frontend in `client/dist/` |
| `docker compose up --build` | Builds and starts the Docker setup |
| `npm run test:websocket` | Runs the local Socket.IO integration smoke test |

The WebSocket smoke test needs the local API and MongoDB running. It creates
temporary local test accounts and removes the test records when it finishes.
Never point its cleanup database setting at production data.

## 13. Quick glossary

| Word | Simple meaning |
| --- | --- |
| Browser | The app that opens websites, such as Chrome or Edge |
| Frontend | The part of the website people see and click |
| Backend | The server code that checks requests and works with saved data |
| Database | The organized storage where the app remembers information |
| Component | A reusable piece of a React page |
| Hook | A React function for remembering values or running page-related work |
| Route | A URL path or a server address that handles a request |
| Endpoint | One specific API route |
| Request | A message asking a server to do or return something |
| Response | The server's answer to a request |
| Schema | A set of rules describing which fields and values are allowed |
| Cookie | A small value the browser saves and sends back to a website |
| Token | A signed piece of information used to prove a session |
| Proxy | A middleman that forwards a request to another server |
| Build | Turning developer source files into files ready to publish |
| Container | A running app packaged by Docker |
| Pipeline | Automated steps that run in a chosen order |
| WebSocket | A live, two-way connection between browser and server |
