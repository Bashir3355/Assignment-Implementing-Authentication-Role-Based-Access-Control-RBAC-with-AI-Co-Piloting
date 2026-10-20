# Week 02 — Authentication & Role-Based Access Control (RBAC)

A small web application demonstrating registration, login, logout, authenticated user dashboards, and admin-only access. **Stack:** Node.js 20+, Express, bcryptjs, express-session, Helmet, and vanilla HTML/CSS/JavaScript.

## Local setup (Windows PowerShell)

1. Install Node.js 20 or later. Open a terminal in this project folder.
2. Run `npm install`.
3. Copy the environment example: `Copy-Item .env.example .env`.
4. Edit `.env` and replace `SESSION_SECRET` with a securely generated random value of at least 32 characters. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
5. Run `npm start` and visit **http://localhost:3000**.
6. Register a standard user with a password of 12+ characters, then log in.
7. To create an Admin, stop the server and run in PowerShell:
   ```powershell
   $env:ADMIN_USERNAME="teacheradmin"
   $env:ADMIN_PASSWORD="Choose-A-Unique-Strong-Password!"
   node create-admin.js
   Remove-Item Env:ADMIN_PASSWORD
   Remove-Item Env:ADMIN_USERNAME
   ```
   Restart with `npm start`. Log in using the Admin credentials you created. **Public registration can never create an Admin.**
8. Run `npm test` for automated security and functionality checks.

## Routes

| Route | Access | Expected response |
|---|---|---|
| GET `/api/public` | Anyone | 200 |
| POST `/api/register` | Anyone; creates User only | 201 / 400 / 409 |
| POST `/api/login` | Anyone | 200 / 400 / 401 |
| POST `/api/logout` | Anyone | 200 |
| GET `/api/user` | Authenticated User or Admin | 200 / 401 |
| GET `/api/admin` | Admin only | 200 / 401 / 403 |

## Security audit

- Passwords are salted and hashed using **bcrypt with cost 12**, never saved in plaintext.
- Admin authorization is checked in **backend middleware**, not just by hiding frontend buttons.
- User creation always assigns `User`; admin accounts must be provisioned separately by a local CLI.
- Session secret is read from `.env`, excluded by `.gitignore`. Cookies use HttpOnly, SameSite Strict, and Secure when `NODE_ENV=production`.
- Login returns the same `Invalid username or password` error for nonexistent accounts and incorrect passwords. Rate limiting mitigates brute-force attempts.
- Session IDs regenerate on login, sessions are destroyed on logout, and responses exclude password hashes.
- Basic origin validation is applied to unsafe requests; for an internet-facing app add a full CSRF defense and a production session store.

### Identified AI-output security improvement

**Audit finding:** An initial draft pattern that relies on frontend role-based button visibility is unsafe because a user can request `/api/admin` directly. **Correction:** Added backend `authenticated` and `adminOnly` middleware; non-admin requests now receive HTTP 403. The code in this repository is the corrected implementation. This is an identified design risk and mitigation, **not a claim that a prior generated file was tested**.

### Production limitations

This is a **local teaching demo**, not a production-ready authentication service. The default `express-session` MemoryStore loses sessions on restart and is not designed for production. The JSON user file is a local demonstration store, not a concurrent database. For deployment, migrate to a database, use Redis or another durable session store, add robust CSRF tokens, HTTPS, secure proxy configuration, account recovery, and monitoring. Do not deploy this configuration with real personal data.

## AI disclosure and exact prompt log

**AI tool:** OpenAI ChatGPT (GPT-6).

**Prompt 1 — User assignment:** “Implementing Authentication & Role-Based Access Control (RBAC) with AI Co-Piloting,” including requirements for registration/login, User and Admin roles, secure password hashing, backend route guards, public/protected/admin endpoints, security audit, QA, README, and video walkthrough. (Full assignment instructions supplied in the ChatGPT conversation.)

**Prompt 2 — Exact user request:** “Human/ complete this and follow the details or instructions, and create well done.”

**AI-generated output:** Express server, bcrypt hashing, cookie sessions, server-side RBAC, frontend, automated tests, admin provisioning script, README, and recording script. **Human verification still required:** Run the app and tests on your computer, inspect the stored hashes, verify DevTools, and record the demonstration. No manually executed test results are claimed here.

## QA checklist (fill in after actually running)

| Test | Expected | Result |
|---|---|---|
| Register new user | 201 | Not yet verified locally |
| Log in with valid password | 200 and session | Not yet verified locally |
| Invalid password | 401, generic message | Not yet verified locally |
| Log out and reuse session | 401 | Not yet verified locally |
| User accesses user dashboard | 200 | Not yet verified locally |
| User accesses admin dashboard | 403 | Not yet verified locally |
| Admin accesses user and admin dashboards | 200, 200 | Not yet verified locally |
| Logged-out user accesses protected routes | 401 | Not yet verified locally |
| Empty credentials | 400 or client rejection | Not yet verified locally |
| SQL-like username | 400, no crash | Not yet verified locally |
| Browser Network tab | 200 / 401 / 403 | Not yet verified locally |
| Browser Console | No uncaught exceptions | Not yet verified locally |
| Inspect `users.json` | bcrypt hashes, no plaintext | Not yet verified locally |

The automated `npm test` suite covers public access, unauthenticated denial, validation, registration, invalid login, valid login, user access, user-to-admin 403, logout, and password hashing. Admin positive access and browser inspection require manual verification.

## Submission links

- **Live demo:** N/A — Local Server/CLI
- **GitHub:** Add URL after pushing
- **Video:** Add URL after recording and uploading

See `VIDEO_SCRIPT.md` for the 6-minute demonstration plan.
