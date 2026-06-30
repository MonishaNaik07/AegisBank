"""
AI Financial Tips

Generates personalized financial advice based on
the user's balances, spending and savings.
"""

import random


def format_currency(amount):
    try:
        return f"${float(amount):,.2f}"
    except Exception:
        return "$0.00"


GENERAL_TIPS = [
    "Maintain an emergency fund covering at least 6 months of expenses.",
    "Review your monthly subscriptions and cancel unused services.",
    "Save at least 20% of your monthly income whenever possible.",
    "Avoid spending more than 30% of your income on lifestyle expenses.",
    "Monitor your transactions regularly to detect suspicious activity early.",
    "Enable two-factor authentication for better account security.",
    "Avoid keeping all of your savings in one account.",
    "Review your spending every month to identify unnecessary expenses."
]


def get_financial_tip(context):

    accounts = context.get("accounts", [])

    spending = context.get("spendingCategories", {})

    summary = context.get("monthlySummary", {})

    total_balance = sum(
        float(acc.get("balance", 0))
        for acc in accounts
    )

    income = float(summary.get("income", 0))

    expenses = float(summary.get("expenses", 0))

    savings = float(summary.get("savings", 0))

    # --------------------------------------------------
    # No account
    # --------------------------------------------------

    if not accounts:
        return (
            "💡 AI Financial Tip\n\n"
            "Open a savings account to start tracking your financial health."
        )

    # --------------------------------------------------
    # Low balance
    # --------------------------------------------------

    if total_balance < 1000:
        return (
            "💡 AI Financial Tip\n\n"
            f"Your combined account balance is only {format_currency(total_balance)}.\n\n"
            "Consider building an emergency fund before increasing discretionary spending."
        )

    # --------------------------------------------------
    # Spending higher than income
    # --------------------------------------------------

    if income > 0 and expenses > income:

        difference = expenses - income

        return (
            "⚠ Budget Alert\n\n"
            f"You spent {format_currency(difference)} more than your income.\n\n"
            "Try reducing shopping and entertainment expenses next month."
        )

    # --------------------------------------------------
    # Low savings
    # --------------------------------------------------

    if income > 0:

        savings_rate = (savings / income) * 100

        if savings_rate < 20:

            return (
                "💰 Savings Advice\n\n"
                f"You're currently saving {savings_rate:.1f}% of your monthly income.\n\n"
                "Aim for at least 20% to improve your long-term financial health."
            )

    # --------------------------------------------------
    # Highest spending category
    # --------------------------------------------------

    if spending:

        highest = max(
            spending.items(),
            key=lambda x: x[1]
        )

        return (
            "📊 Spending Insight\n\n"
            f"Your highest spending category is:\n\n"
            f"{highest[0]}\n"
            f"{format_currency(highest[1])}\n\n"
            "Review this category to see whether any expenses can be reduced."
        )

    # --------------------------------------------------
    # Default AI Tip
    # --------------------------------------------------

    return (
        "💡 Today's AI Financial Tip\n\n"
        + random.choice(GENERAL_TIPS)
    )