# Second-Hand Marketplace — Full-Stack Project Roadmap

This roadmap breaks the marketplace build into 10 phases. Each phase has five
tiers. Check off individual tasks as they are completed, then check the tier
completion box when every task in that tier is done. Check the phase box only
after all of its tiers are complete and the phase acceptance criteria pass.

## Project scope

Build a responsive marketplace where people can create accounts, list second-hand
items, discover and save listings, contact sellers in real time, and manage
their own listings. The application will use React, Tailwind CSS, a REST API,
MongoDB/Mongoose, JWT authentication, automated API testing, WebSockets, and a
Docker-based CI/CD deployment workflow.

## Phase 1 — Define the product and prepare the project

**Phase complete:** [ ]

### Tier 1.1 — Define users and marketplace workflows

- [ ] Identify the primary user roles: visitor, buyer, seller, and administrator.
- [ ] Write the key workflows for registration, sign-in, browsing, searching, and viewing listings.
- [ ] Write the seller workflow for creating, editing, marking sold, and deleting a listing.
- [ ] Define how buyers contact sellers and how saved listings work.
- [ ] Record project goals, assumptions, and out-of-scope features.
- **Tier complete:** [ ]

### Tier 1.2 — Specify features and acceptance criteria

- [ ] Create a prioritized feature list for the first usable release.
- [ ] Define listing fields, including title, description, price, category, condition, location, and photos.
- [ ] Define search, filter, sort, and pagination behavior.
- [ ] Define account, listing, messaging, and moderation permissions.
- [ ] Write observable acceptance criteria for each major user workflow.
- **Tier complete:** [ ]

### Tier 1.3 — Choose architecture and project conventions

- [x] Select the React application setup and document the chosen build tool.
- [x] Select the Node.js API framework and document the API entry point.
- [x] Define the client/server directory structure and module boundaries.
- [x] Choose environment-variable names and document which values are secrets.
- [x] Define naming, formatting, linting, and error-response conventions.
- **Tier complete:** [ ]

### Tier 1.4 — Set up source control and local development

- [ ] Initialize the Git repository and add a suitable `.gitignore`.
- [x] Add client and server package manifests with development scripts.
- [x] Add example environment files that contain placeholders only.
- [x] Configure a local MongoDB development connection or documented equivalent.
- [x] Confirm the client and API can each start locally.
- **Tier complete:** [ ]

### Tier 1.5 — Establish quality and delivery basics

- [x] Add a README with prerequisites and local setup instructions.
- [x] Add formatter and linter configuration for the chosen stack.
- [x] Add a basic health-check endpoint and verify it locally.
- [x] Add a test command for each application area.
- [x] Capture the initial architecture and feature decisions in project documentation.
- **Tier complete:** [x]

## Phase 2 — Build responsive and interactive UIs with Tailwind CSS

**Phase complete:** [ ]

### Tier 2.1 — Create the visual foundation

- [x] Install and configure Tailwind CSS for the React application.
- [x] Define reusable color, spacing, typography, and breakpoint conventions.
- [x] Create shared page-container, button, input, badge, and card styles.
- [ ] Add global focus, selection, and reduced-motion-friendly styles.
- [x] Verify the base layout works at mobile, tablet, and desktop widths.
- **Tier complete:** [ ]

### Tier 2.2 — Build shared navigation and page structure

- [x] Create a responsive header with marketplace branding and primary navigation.
- [ ] Add accessible mobile navigation with clear open and close behavior.
- [x] Create a shared footer with useful links and project information.
- [ ] Add reusable page layouts for public, authenticated, and administrative views.
- [ ] Verify keyboard navigation and visible focus states across shared components.
- **Tier complete:** [ ]

### Tier 2.3 — Build marketplace discovery screens

- [x] Create the home page with a prominent search entry point and featured listings.
- [x] Create a listing-results page with responsive listing cards.
- [ ] Add category, price, condition, and location filter controls to the UI.
- [ ] Add sorting, pagination or load-more controls, and empty-result states.
- [ ] Add loading, failure, and retry states for listing data.
- **Tier complete:** [ ]

### Tier 2.4 — Build listing and account screens

- [x] Create a listing detail page with image gallery, seller summary, and item details.
- [x] Create sign-up, sign-in, and account-profile forms.
- [x] Create a listing form with create and edit modes.
- [ ] Create a seller dashboard for managing active, sold, and draft listings.
- [ ] Create saved-listing and account-settings screens.
- **Tier complete:** [ ]

### Tier 2.5 — Make interactions accessible and polished

- [ ] Add client-side form feedback and clear inline validation messages.
- [ ] Add confirmation flows for destructive listing actions.
- [ ] Ensure controls have labels, semantic roles, and useful accessible names.
- [ ] Check color contrast, text scaling, touch targets, and screen-reader behavior.
- [ ] Test representative screens at narrow, medium, and wide viewport sizes.
- **Tier complete:** [ ]

## Phase 3 — Experiment with React Hooks and manage application state

**Phase complete:** [ ]

### Tier 3.1 — Apply React state and effect patterns

- [ ] Use local state for isolated UI interactions such as menus and form fields.
- [ ] Load listing data with `useEffect` or the project’s selected data-fetching pattern.
- [ ] Handle effect cleanup, stale requests, and component unmounting safely.
- [ ] Keep derived values derived rather than duplicating them in state.
- [ ] Add tests for important stateful UI behavior.
- **Tier complete:** [ ]

### Tier 3.2 — Share session and app-wide state

- [x] Define the authentication/session state shape and lifecycle.
- [ ] Use Context API for stable app-wide concerns such as the current user and theme, where appropriate.
- [ ] Keep context providers focused and avoid rerendering unrelated parts of the app.
- [ ] Define behavior for loading, expired, and signed-out sessions.
- [ ] Verify protected screens respond correctly when session state changes.
- **Tier complete:** [ ]

### Tier 3.3 — Build and reuse custom hooks

- [x] Create a reusable hook for API requests or the selected query library.
- [x] Create a hook for authentication/session access.
- [ ] Create a hook for debounced marketplace search input.
- [ ] Create a hook for saved-listing actions or another repeated marketplace interaction.
- [ ] Test hook loading, success, failure, and cleanup behavior.
- **Tier complete:** [ ]

### Tier 3.4 — Organize complex state

- [ ] Identify state that is shared across routes or feature areas.
- [x] Choose Redux Toolkit or Context API based on actual state complexity and document the decision.
- [ ] If using Redux Toolkit, define typed store configuration, slices, and selectors.
- [ ] If using Context API, split state and actions into focused providers as needed.
- [ ] Keep server-owned data distinct from transient client-only UI state.
- **Tier complete:** [ ]

### Tier 3.5 — Connect state to marketplace workflows

- [ ] Connect search, filter, sort, and pagination state to listing requests.
- [ ] Keep saved-listing state synchronized with successful API responses.
- [ ] Handle optimistic updates only where rollback behavior is implemented and tested.
- [ ] Reset or retain filters consistently when users navigate between marketplace pages.
- [ ] Verify state behavior across refreshes, route changes, and authentication changes.
- **Tier complete:** [ ]

## Phase 4 — Design REST APIs and integrate MongoDB with Mongoose

**Phase complete:** [ ]

### Tier 4.1 — Design the API contract

- [x] Define resource names and REST routes for accounts, listings, favorites, and conversations.
- [ ] Define request and response shapes for each required endpoint.
- [ ] Choose consistent status codes and error-response structure.
- [ ] Define pagination, filtering, sorting, and search parameters.
- [ ] Document authentication requirements and ownership rules per route.
- **Tier complete:** [ ]

### Tier 4.2 — Model marketplace data with Mongoose

- [x] Create a user schema with normalized identity fields, role, and timestamps.
- [x] Create a listing schema with validated marketplace fields and seller reference.
- [x] Model favorites and conversations/messages according to the chosen access patterns.
- [x] Add indexes for common lookups, including listing search/filter fields and ownership.
- [ ] Define deletion, archival, and relationship behavior for associated records.
- **Tier complete:** [ ]

### Tier 4.3 — Connect and validate the database layer

- [ ] Configure the MongoDB connection from environment variables.
- [ ] Handle connection startup and database errors explicitly.
- [ ] Add schema validation, defaults, and controlled update behavior.
- [ ] Prevent mass assignment by allowing only approved fields in writes.
- [ ] Add test-database setup and cleanup for API integration tests.
- **Tier complete:** [ ]

### Tier 4.4 — Implement core REST endpoints

- [x] Implement listing creation, retrieval, update, and deletion endpoints.
- [x] Implement listing search with filters, sorting, and pagination.
- [ ] Implement user profile retrieval and permitted profile updates.
- [x] Implement favorite add, remove, and list endpoints.
- [ ] Implement consistent not-found, validation, and database-error responses.
- **Tier complete:** [ ]

### Tier 4.5 — Integrate the React client with the API

- [x] Configure a shared API client with a single base URL source.
- [x] Connect marketplace results and listing details to API data.
- [x] Connect account and listing forms to create/update endpoints.
- [ ] Display server validation errors and recoverable request failures in the UI.
- [ ] Verify client/server request and response contracts with representative workflows.
- **Tier complete:** [ ]

## Phase 5 — Create secure, production-ready RESTful APIs

**Phase complete:** [ ]

### Tier 5.1 — Validate and normalize all input

- [ ] Add request validation for path parameters, query parameters, and request bodies.
- [ ] Normalize user-provided strings and reject malformed or unsupported values.
- [ ] Enforce sensible limits for text length, prices, page sizes, and uploaded metadata.
- [ ] Reject unknown or protected fields rather than silently accepting them.
- [ ] Return safe, consistent validation errors without exposing internals.
- **Tier complete:** [ ]

### Tier 5.2 — Protect API access and data

- [ ] Apply authentication and authorization middleware to protected routes.
- [ ] Enforce resource ownership checks for listing and account mutations.
- [ ] Restrict administrator-only operations to authorized administrators.
- [ ] Prevent NoSQL injection through validated query construction and safe filters.
- [ ] Configure CORS for known application origins and required methods only.
- **Tier complete:** [ ]

### Tier 5.3 — Add operational API safeguards

- [ ] Add request-size limits and appropriate security headers.
- [ ] Add rate limiting to authentication and other abuse-prone endpoints.
- [ ] Avoid returning secrets, password hashes, tokens, or stack traces in responses.
- [ ] Add structured logs with request context while excluding credentials and sensitive data.
- [ ] Define health/readiness behavior and graceful database shutdown.
- **Tier complete:** [ ]

### Tier 5.4 — Handle errors and production configuration

- [ ] Centralize API error handling and map known errors to appropriate status codes.
- [ ] Ensure unexpected errors are logged and returned as safe server errors.
- [ ] Validate required environment configuration at application startup.
- [ ] Separate development, test, and production configuration without committing secrets.
- [ ] Document backup, data-retention, and incident-response expectations for the initial release.
- **Tier complete:** [ ]

### Tier 5.5 — Review security and reliability behavior

- [ ] Test unauthorized, forbidden, invalid, oversized, and abusive requests.
- [ ] Verify every protected mutation checks both role and resource ownership.
- [ ] Check dependency vulnerabilities using the package manager’s audit tooling.
- [ ] Verify logs and error responses do not reveal sensitive information.
- [ ] Record and resolve release-blocking security and reliability issues.
- **Tier complete:** [ ]

## Phase 6 — Implement JWT authentication and user roles

**Phase complete:** [ ]

### Tier 6.1 — Implement account registration and credentials

- [x] Add registration with validated, unique account identifiers.
- [x] Hash passwords with an established password-hashing library and safe parameters.
- [x] Prevent password hashes and credential fields from appearing in API responses.
- [x] Add sign-in with generic failure messages that do not disclose account existence.
- [ ] Add tests for duplicate accounts, invalid inputs, and incorrect credentials.
- **Tier complete:** [ ]

### Tier 6.2 — Issue and verify JWTs safely

- [x] Define the token claims and expiration appropriate to the application.
- [x] Sign tokens using a secret or key supplied only through secure configuration.
- [x] Verify signature, expiration, issuer, and audience as configured.
- [x] Keep token handling consistent with the selected secure storage and transport approach.
- [ ] Add tests for missing, malformed, expired, and invalidly signed tokens.
- **Tier complete:** [ ]

### Tier 6.3 — Define roles and authorization rules

- [ ] Implement the visitor, buyer, seller, and administrator permissions.
- [ ] Add reusable role and ownership authorization checks.
- [ ] Prevent users from granting themselves elevated roles through profile updates.
- [ ] Enforce seller-only listing mutations and administrator-only moderation actions.
- [ ] Test allowed and denied actions for each role and resource ownership case.
- **Tier complete:** [ ]

### Tier 6.4 — Connect authentication to the React app

- [x] Add sign-up and sign-in flows backed by the authentication API.
- [x] Restore session state safely when the application starts.
- [x] Add route guards and role-aware navigation without relying on them as API security.
- [x] Add sign-out and session-expiration handling.
- [ ] Show clear authentication and authorization feedback to the user.
- **Tier complete:** [ ]

### Tier 6.5 — Complete account lifecycle behavior

- [x] Add authenticated current-user retrieval and profile updates.
- [ ] Define and implement token renewal or re-authentication behavior if required.
- [ ] Ensure password changes invalidate or appropriately refresh existing sessions.
- [ ] Verify sign-out, expired-session, and revoked/invalid-session behavior.
- [ ] Document the final authentication flow, token handling, and role matrix.
- **Tier complete:** [ ]

## Phase 7 — Validate RESTful APIs using Postman

**Phase complete:** [ ]

### Tier 7.1 — Set up a maintainable Postman collection

- [x] Create a collection organized by authentication, listings, users, favorites, and messaging.
- [x] Add base URL and environment variables without storing real credentials in source control.
- [x] Add example requests with representative valid payloads.
- [ ] Document required setup and test-data assumptions in the collection.
- [ ] Keep secrets and personal data out of exported collection files.
- **Tier complete:** [ ]

### Tier 7.2 — Test successful API workflows

- [ ] Test registration, sign-in, current-user retrieval, and sign-out/session behavior.
- [ ] Test listing creation, listing retrieval, search, update, and deletion.
- [ ] Test filters, sorting, and pagination using representative data.
- [ ] Test favorite creation, retrieval, and removal.
- [ ] Test seller and administrator workflows using appropriately authorized accounts.
- **Tier complete:** [ ]

### Tier 7.3 — Test validation and authorization failures

- [ ] Test missing and malformed fields, invalid identifiers, and invalid query parameters.
- [ ] Test unauthenticated requests to protected endpoints.
- [ ] Test insufficient-role and non-owner attempts to modify resources.
- [ ] Test expired and malformed JWTs.
- [ ] Confirm error status codes and response bodies match the documented API contract.
- **Tier complete:** [ ]

### Tier 7.4 — Automate useful collection assertions

- [ ] Add status-code and response-shape assertions to important requests.
- [ ] Capture access tokens through test scripts without hard-coding them.
- [ ] Add assertions for validation errors and role/ownership denials.
- [ ] Run the collection with the selected Postman command-line runner or CI integration.
- [ ] Make test failures visible through nonzero exit status and actionable output.
- **Tier complete:** [ ]

### Tier 7.5 — Close API contract gaps

- [ ] Compare the collection with the documented endpoint and permission inventory.
- [ ] Add coverage for discovered missing routes and edge cases.
- [ ] Confirm tests use isolated, repeatable test data.
- [ ] Record known limitations and any intentionally deferred API tests.
- [ ] Re-run the complete API collection against a clean test environment.
- **Tier complete:** [ ]

## Phase 8 — Enable real-time communication with WebSockets

**Phase complete:** [ ]

### Tier 8.1 — Design the real-time messaging workflow

- [ ] Define conversation membership and the message data contract.
- [ ] Define events for joining, sending, receiving, and leaving conversations.
- [ ] Decide how persisted REST data and live WebSocket events work together.
- [ ] Define authorization rules for conversation access and message delivery.
- [ ] Document reconnect, duplicate-delivery, and offline-user behavior.
- **Tier complete:** [ ]

### Tier 8.2 — Configure the WebSocket server

- [x] Add the chosen WebSocket library and attach it to the API server.
- [x] Configure allowed origins and connection-level security settings.
- [x] Authenticate socket connections using the established session approach.
- [x] Validate event payloads and authorize room or conversation membership.
- [ ] Handle disconnects and server errors without leaking sensitive information.
- **Tier complete:** [ ]

### Tier 8.3 — Persist and deliver messages

- [x] Store messages with sender, conversation, body, and timestamp fields.
- [x] Implement conversation history retrieval with access control and pagination.
- [x] Broadcast new messages only to authorized conversation participants.
- [x] Add a clear acknowledgement or failure response for message sends.
- [x] Prevent invalid, oversized, or unauthorized messages from being persisted or broadcast.
- **Tier complete:** [ ]

### Tier 8.4 — Build the real-time client experience

- [ ] Connect and disconnect the client socket according to the user session lifecycle.
- [ ] Build a conversation list and message thread UI.
- [ ] Display incoming messages without requiring a page refresh.
- [ ] Add sending, retry/failure, loading, and empty states.
- [ ] Reconcile live events with persisted history after reconnect or route changes.
- **Tier complete:** [ ]

### Tier 8.5 — Verify real-time behavior

- [x] Test communication between two authorized users in separate sessions.
- [x] Test rejection of unauthorized connections and conversation access.
- [ ] Test disconnect, reconnect, and duplicate-event handling.
- [x] Verify messages survive reloads through persisted conversation history.
- [ ] Check that socket events and logs do not expose tokens or private message content unnecessarily.
- **Tier complete:** [ ]

## Phase 9 — Set up CI/CD with GitHub Actions and Render or Vercel

**Phase complete:** [ ]

### Tier 9.1 — Prepare deployable application configuration

- [x] Choose and document hosting targets for the React client and API.
- [x] Configure production build and start scripts for the selected hosting platform.
- [x] Set production environment variables through the platform’s secret/configuration settings.
- [x] Configure the production API URL and permitted client origin.
- [ ] Verify the deployed client, API, database, and WebSocket endpoints can communicate.
- **Tier complete:** [ ]

### Tier 9.2 — Build GitHub Actions quality checks

- [x] Add a workflow that runs on pull requests and relevant branch pushes.
- [x] Install dependencies reproducibly using lockfiles and supported Node.js versions.
- [x] Run client and server lint checks.
- [x] Run relevant client, server, and API tests.
- [ ] Build the client and verify the API can start or pass its production check.
- **Tier complete:** [ ]

### Tier 9.3 — Configure safe deployment automation

- [ ] Choose deployment triggers and environments for preview and production releases.
- [ ] Store deployment credentials as GitHub Actions secrets or use platform integrations.
- [ ] Prevent secrets from being printed in logs or exposed to untrusted pull requests.
- [ ] Gate production deployment on successful required checks.
- [ ] Document how to roll back or redeploy a known-good version.
- **Tier complete:** [ ]

### Tier 9.4 — Add release and deployment verification

- [ ] Confirm a successful workflow deploys the intended commit and environment.
- [ ] Add post-deployment health checks for the API and client.
- [ ] Verify database connectivity, authentication, listing flows, and WebSocket connectivity in production.
- [ ] Surface deployment failures and health-check failures clearly.
- [ ] Record deployment URL, environment configuration steps, and release procedure in the README.
- **Tier complete:** [ ]

### Tier 9.5 — Validate ongoing delivery behavior

- [ ] Confirm pull requests cannot deploy unreviewed changes to production.
- [ ] Confirm failed lint, test, or build steps stop the deployment workflow.
- [ ] Confirm secrets are unavailable to forked/untrusted pull-request workflows.
- [ ] Confirm deployment can be repeated without manual local-only steps.
- [ ] Run a release rehearsal and resolve any blocking issues.
- **Tier complete:** [ ]

## Phase 10 — Deploy the full-stack app with Docker and DevOps practices

**Phase complete:** [ ]

### Tier 10.1 — Containerize the application

- [x] Add a production Dockerfile for the API with a minimal supported runtime image.
- [x] Add a production Dockerfile for the React client or its chosen static-serving target.
- [x] Use multi-stage builds where they reduce production image size or build-time dependencies.
- [x] Run containers as a non-root user where supported.
- [x] Add `.dockerignore` files that exclude dependencies, secrets, and unnecessary files.
- **Tier complete:** [x]

### Tier 10.2 — Define local multi-service operation

- [x] Add a Docker Compose configuration for the client, API, and local MongoDB service.
- [x] Configure service-to-service networking and persistent local database storage.
- [x] Load local configuration through ignored environment files or environment variables.
- [x] Add health checks and appropriate service startup dependencies.
- [x] Document build, start, stop, and local data-reset commands.
- **Tier complete:** [x]

### Tier 10.3 — Harden and verify container images

- [x] Ensure production images contain no credentials, development secrets, or local data.
- [x] Pin or constrain base images and keep dependencies reproducible.
- [ ] Verify container health checks and graceful shutdown behavior.
- [ ] Scan built images and dependencies for known vulnerabilities.
- [ ] Run the application containers and verify core marketplace workflows.
- **Tier complete:** [ ]

### Tier 10.4 — Connect Docker to deployment and operations

- [ ] Configure the selected hosting environment to build or deploy the production containers.
- [ ] Set production secrets and configuration outside the images.
- [ ] Verify persistent database storage and backup expectations for the chosen platform.
- [ ] Configure application logs and health monitoring suitable for the initial release.
- [ ] Define rollback, recovery, and incident contact/procedure expectations.
- **Tier complete:** [ ]

### Tier 10.5 — Complete production-readiness checks

- [ ] Verify responsive browsing, listing management, authentication, favorites, and messaging in production.
- [ ] Verify authorization, input validation, and API security checks in the deployed environment.
- [ ] Verify CI/CD, container build, health checks, and documented rollback procedure.
- [ ] Review performance, accessibility, dependency health, and operational documentation.
- [ ] Fix release-blocking issues and record accepted limitations.
- **Tier complete:** [ ]

## Project completion

**Project complete:** [ ]

- [ ] All 10 phase completion boxes are checked.
- [ ] The production application and its required services are available and healthy.
- [ ] Setup, testing, deployment, and operational instructions are current.
- [ ] No known release-blocking defects or unresolved critical security issues remain.
