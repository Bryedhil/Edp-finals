# ClassFunds — Student Expense List System Frontend

React + Vite frontend with role-based sign-in.

## Setup
1. Install Node.js (Node 20 LTS recommended).
2. Run `npm install`.
3. Copy `.env.example` to `.env` on Windows with `copy .env.example .env`.
4. Run `npm run dev`.
5. Keep the backend running at `http://localhost:5000`.

## Login
Use the username and temporary password from the private student credential CSV. Student usernames are student IDs when provided, otherwise the generated username in the CSV. Students are required to change their temporary password on first login. Admin/treasurer accounts use the same login page. The Student Balances page lets admins/treasurers assign, edit, and delete individual student expenses, record payments, and view each student’s automatically calculated balance and payment status.

The frontend reads `VITE_API_URL` (defaults to `http://localhost:5000/api`).

## Security
Do not put passwords in frontend source code. Authentication is handled by the Express API. Student accounts see only their own portal records; class-wide management endpoints are restricted to treasurer/admin roles.


## AI features
- **Cathrine — Expense Assistant:** Students can ask about only their own assigned charges and recorded payments. Admins/treasurers can ask questions about authorized class-level records.
- **AI Financial Summary:** Admins/treasurers can generate a plain-language snapshot of assigned expenses, payments, outstanding balances, and student payment statuses.

To enable Cathrine, configure `GEMINI_API_KEY` in the **backend** `.env` file and restart the backend. Do not put the Gemini API key in this frontend folder. The frontend sends authenticated requests to the backend routes `/api/ai/chat` and `/api/ai/admin-summary`; the backend handles Gemini calls and access control. Without a valid backend Gemini configuration, AI requests may show a configuration error, while the regular system can still work.
