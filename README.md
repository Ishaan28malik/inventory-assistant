# Inventory & Procurement Assistant

A chat assistant for a small manufacturing company. Three people use it:

| Role | What they care about |
|---|---|
| Business Owner | Spend, vendors, unpaid amounts, overall stock health |
| Procurement Owner | Open POs, late deliveries, unmatched receipts, vendors |
| Inventory Owner | Stock by location, movement over time, items below minimum, what was issued to which team |

You pick a role, type a question in plain English, and the bot answers with text and a chart
where one helps (for example *"Show inventory movement of items for the last 6 months"*).

## How it works

```
Next.js (chat UI)  --->  FastAPI  --->  LangGraph agent  --->  Postgres (Railway)
                                            |
                                          OpenAI
```

The agent is a small LangGraph with four steps:

1. **write_sql** - the LLM turns the question into one SQL query using a hand-written description of the schema (`backend/schema.py`). It also decides if the question is a read, a write, or just small talk.
2. **check_access** - role based access control. Each role has a list of tables it may read and write (`backend/roles.py`). If the SQL touches a table the role can't see, the bot refuses. Dangerous SQL (DELETE, DROP, multiple statements) is blocked here too.
3. **run_sql** - runs the query in a read-only transaction. If Postgres returns an error, the graph loops back to step 1 once with the error message so the LLM can fix it.
4. **answer** - the LLM writes a short plain-English answer and picks a chart type (line for trends, bar for comparisons, none for a single number). The frontend renders it with Recharts.

**Writes (bonus):** if the user asks to change something (e.g. *"set the minimum stock level of item X at 132-1 to 20"*), the bot shows the change and waits for a **Confirm** button click before saving. Only INSERT / UPDATE on tables the role is allowed to change.

## Running it locally

Backend (Python 3.11+):

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add OPENAI_API_KEY and DATABASE_URL
uvicorn main:app --reload --port 8000
```

Frontend (Node 18+):

```bash
cd frontend
npm install
npm run dev                 # http://localhost:3000
```

Optional LangSmith tracing: set `LANGSMITH_TRACING=true` and `LANGSMITH_API_KEY` in `backend/.env`.

## Tests

The test cases were written first, as the definition of done.

```bash
cd backend
pytest tests/test_safety.py -v      # guard rails and permissions, no LLM needed
pytest tests/test_questions.py -v   # 18 real questions across the 3 roles (calls OpenAI + DB)
```

## Assumptions

- **No login.** Roles are picked from a dropdown. Real authentication would map a logged-in user to one of these roles.
- **Access control is per table, not per column.** For example the Inventory Owner can see POs (to know what is arriving) but not vendors or payment tranches.
- **The data is what it is.** Inventory transactions start in late April 2026 and POs in August 2026, so "last 6 months" shows the months that have data. No fake data was added.
- **Messy columns are explained to the model, not fixed.** Expected delivery dates are stored as JSON arrays, payment stage names have inconsistent spelling, outbound quantities are negative. The schema notes tell the LLM how to handle each.
- **PO approval is not in the database.** The process in the brief has an approval step before a PO is created, but there is no approval status in the tables, so the bot can't report on it.
- **Model:** `gpt-4.1-mini` by default (cheap, and it summarised numbers more accurately than gpt-4o-mini in testing). Change `OPENAI_MODEL` in `.env` to try another.

## Project layout

```
backend/
  main.py       FastAPI endpoints: /chat, /confirm, /roles
  agent.py      the LangGraph agent
  roles.py      the 3 roles, their table permissions and suggested questions
  guards.py     SQL safety checks + permission checks
  schema.py     plain-English description of the database for the LLM
  db.py         Postgres helpers
  tests/        test_safety.py (offline) and test_questions.py (end to end)
frontend/
  app/page.js           the chat page
  components/Chart.js   renders the chart the agent picks
```
