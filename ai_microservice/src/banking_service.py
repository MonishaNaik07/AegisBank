"""
Dynamic banking responses.

This file uses the context received from Node.js
to generate personalized responses.
"""


def format_currency(amount):
    try:
        return f"${float(amount):,.2f}"
    except Exception:
        return "$0.00"


# ---------------------------------------------------------
# Balance
# ---------------------------------------------------------

def get_balance(context):

    accounts = context.get("accounts", [])

    if not accounts:
        return (
            "⚠ You don't have any active bank accounts.\n\n"
            "Please apply for an account from your dashboard."
        )

    lines = []

    total_balance = 0

    for acc in accounts:

        balance = float(acc.get("balance", 0))
        total_balance += balance

        status = acc.get("status", "active")

        account_type = acc.get("accountType", "Account")

        account_number = acc.get("accountNumber", "Unknown")

        if status == "active":
            status_text = "🟢 Active"
        else:
            status_text = f"🔴 {status.title()}"

        lines.append(
            f"""
{account_type}

Account : {account_number}

Balance : {format_currency(balance)}

Status  : {status_text}
""".strip()
        )

    return (
        "💰 ACCOUNT BALANCES\n\n"
        + "\n\n".join(lines)
        + f"\n\n━━━━━━━━━━━━━━━━━━\n"
        + f"Total Balance : {format_currency(total_balance)}"
    )


# ---------------------------------------------------------
# Recent Transactions
# ---------------------------------------------------------

def get_recent_transactions(context):

    transactions = context.get("recentTransactions", [])

    if not transactions:
        return "📄 No recent transactions found."

    message = "📄 RECENT TRANSACTIONS\n\n"

    for i, txn in enumerate(transactions[:5], start=1):

        txn_type = txn.get("type", "").title()

        amount = format_currency(txn.get("amount", 0))

        remarks = txn.get("remarks") or "No Remarks"

        status = txn.get("status", "").title()

        message += (
            f"{i}. {txn_type}\n"
            f"Amount : {amount}\n"
            f"Remarks : {remarks}\n"
            f"Status : {status}\n\n"
        )

    return message.strip()


# ---------------------------------------------------------
# Monthly Summary
# ---------------------------------------------------------

def get_monthly_summary(context):

    summary = context.get("monthlySummary", {})

    income = summary.get("income", 0)

    expenses = summary.get("expenses", 0)

    savings = summary.get("savings", 0)

    return (
        "📊 MONTHLY SUMMARY\n\n"
        f"Income      : {format_currency(income)}\n"
        f"Expenses    : {format_currency(expenses)}\n"
        f"Savings     : {format_currency(savings)}"
    )


# ---------------------------------------------------------
# Spending Analysis
# ---------------------------------------------------------

def get_spending_analysis(context):

    spending = context.get("spendingCategories", {})

    if not spending:
        return (
            "💸 No spending information available yet.\n\n"
            "Start making transactions to receive AI insights."
        )

    sorted_categories = sorted(
        spending.items(),
        key=lambda x: x[1],
        reverse=True
    )

    total = sum(spending.values())

    message = "💸 SPENDING ANALYSIS\n\n"

    for category, amount in sorted_categories:

        percentage = (amount / total) * 100 if total else 0

        message += (
            f"{category}\n"
            f"{format_currency(amount)} "
            f"({percentage:.1f}%)\n\n"
        )

    highest = sorted_categories[0]

    message += (
        "━━━━━━━━━━━━━━━━━━\n"
        f"Highest Spending\n"
        f"{highest[0]} ({format_currency(highest[1])})"
    )

    return message


# ---------------------------------------------------------
# Savings Goal
# ---------------------------------------------------------

def get_savings_goal(context):

    goal = context.get("savingsGoal", {})

    target = float(goal.get("target", 0))

    current = float(goal.get("current", 0))

    if target <= 0:

        return (
            "🎯 No savings goal configured."
        )

    progress = (current / target) * 100

    if progress > 100:
        progress = 100

    remaining = target - current

    if remaining < 0:
        remaining = 0

    return (
        "🎯 SAVINGS GOAL\n\n"
        f"Goal      : {format_currency(target)}\n"
        f"Saved     : {format_currency(current)}\n"
        f"Remaining : {format_currency(remaining)}\n"
        f"Progress  : {progress:.1f}%"
    )