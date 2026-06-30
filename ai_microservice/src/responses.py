"""
Static chatbot responses.

Dynamic responses (balance, transactions, summaries, etc.)
will be generated inside banking_service.py.

This file is only for fixed replies.
"""

RESPONSES = {

    "greeting": (
        "👋 Hello {name}!\n\n"
        "Welcome to AegisBank AI Assistant.\n\n"
        "I can help you with:\n\n"
        "💰 Account Balances\n"
        "📄 Recent Transactions\n"
        "📊 Monthly Summary\n"
        "💸 Spending Analysis\n"
        "🛡 Security Status\n"
        "🎯 Savings Goals\n"
        "💡 Financial Tips\n"
        "❓ Banking FAQs"
    ),

    "farewell": (
        "😊 Thank you for banking with AegisBank.\n\n"
        "Have a wonderful day!"
    ),

    "unknown": (
        "❌ Sorry, I couldn't understand your request.\n\n"
        "Try asking something like:\n\n"
        "• Check my balance\n"
        "• Show recent transactions\n"
        "• Monthly summary\n"
        "• Spending analysis\n"
        "• Savings goal\n"
        "• Financial tips\n"
        "• What is NEFT?"
    ),

    "no_accounts": (
        "⚠ You don't have any active bank accounts.\n\n"
        "Please open an account first."
    ),

    "no_transactions": (
        "📄 No recent transactions were found."
    ),

    "security_safe": (
        "🛡 Security Status\n\n"
        "✅ No suspicious activity detected.\n\n"
        "Your account is protected by:\n"
        "• AI Fraud Detection\n"
        "• Transaction Monitoring\n"
        "• Secure Authentication"
    ),

    "security_alert": (
        "⚠ Security Alert\n\n"
        "{count} suspicious transaction(s) were detected.\n\n"
        "Please contact customer support if these were not initiated by you."
    ),

    "transfer_help": (
        "💸 Transfer Money\n\n"
        "1. Open the Transfer page.\n"
        "2. Select your account.\n"
        "3. Enter the recipient's account number.\n"
        "4. Enter the amount.\n"
        "5. Click Send.\n\n"
        "Every transaction is checked by our AI Fraud Detection System before processing."
    )
}