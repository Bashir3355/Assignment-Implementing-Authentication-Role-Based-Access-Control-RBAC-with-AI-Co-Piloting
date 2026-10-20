# Week 02 – Video Demonstration Script

# 0:00 – Architecture Overview & AI Security Audit
Hi, this is my Authentication and RBAC project. I used ChatGPT, Node.js, and Express to build the application. I reviewed bcrypt password hashing, session security, and server-side Admin access controls.

# 1:30 – Live Functionality Demo (AuthN & RBAC)
I will demonstrate user registration, login, and logout. A regular user can access the User Dashboard, while an Admin can access both the User and Admin dashboards.

# 3:30 – QA Testing: Negative Cases & DevTools Inspection
I will use browser DevTools to test security. A regular user accessing Admin resources should receive 403 Forbidden, while an unauthenticated request should receive 401 Unauthorized. I will also check invalid passwords, input validation, browser errors, and hashed password storage.

# 5:30 – Conclusion & Lessons Learned
This project taught me that AI-generated code must be reviewed and tested carefully. I learned that secure authentication, password hashing, and server-side authorization are essential for protecting applications.