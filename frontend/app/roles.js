// The three roles shown in the dropdown, with their suggested questions.
// Same as ROLES in backend/roles.py (the backend still decides what each role can access).

const ROLES = {
  "Business Owner": {
    description:
      "Owns the business and approves spend. Wants the overall picture: " +
      "spend, vendors, payments and stock health. Can see everything.",
    suggested_questions: [
      "How much did we spend on purchase orders last month?",
      "Who are our top 5 vendors by PO value?",
      "How much is still unpaid on purchase orders?",
      "Show inbound vs outbound stock movement for the last 6 months",
    ],
  },
  "Procurement Owner": {
    description:
      "Creates and tracks purchase orders, deals with vendors and payments. " +
      "Can see procurement tables plus items and current stock (for reorder decisions), " +
      "but not the detailed stock issue history.",
    suggested_questions: [
      "Which purchase orders are still open?",
      "Which POs are past their expected delivery date?",
      "Show the number of POs by status",
      "Which unexpected receipts are not yet matched to a PO?",
    ],
  },
  "Inventory Owner": {
    description:
      "Receives goods and manages stock across locations. Can see inventory tables " +
      "and incoming POs / receipts, but not vendor details or payments.",
    suggested_questions: [
      "Show inventory movement of items for the last 6 months",
      "Which items are below their minimum stock level?",
      "What stock do we hold at location 132-1?",
      "Which teams were issued the most stock last month?",
    ],
  },
};

export default ROLES;
