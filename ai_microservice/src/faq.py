"""
Banking FAQ Knowledge Base

This module answers common banking questions.
"""

FAQ = {

    "neft": (
        "🏦 NEFT (National Electronic Funds Transfer)\n\n"
        "• Used to transfer money between bank accounts.\n"
        "• Available across India.\n"
        "• Transactions are processed in batches.\n"
        "• Suitable for normal fund transfers."
    ),

    "rtgs": (
        "🏦 RTGS (Real Time Gross Settlement)\n\n"
        "• Used for high-value fund transfers.\n"
        "• Processed instantly.\n"
        "• Typically used for transfers above ₹2,00,000."
    ),

    "imps": (
        "🏦 IMPS (Immediate Payment Service)\n\n"
        "• Instant money transfer.\n"
        "• Available 24×7.\n"
        "• Faster than NEFT.\n"
        "• Ideal for immediate transfers."
    ),

    "upi": (
        "🏦 UPI (Unified Payments Interface)\n\n"
        "• Instant bank-to-bank transfer.\n"
        "• Works 24×7.\n"
        "• Uses UPI ID or QR Code.\n"
        "• No account number is required."
    ),

    "kyc": (
        "🪪 KYC (Know Your Customer)\n\n"
        "Banks verify your identity using documents like:\n\n"
        "• Aadhaar\n"
        "• PAN Card\n"
        "• Passport\n"
        "• Driving Licence\n\n"
        "KYC helps prevent fraud and money laundering."
    ),

    "fd": (
        "💰 Fixed Deposit (FD)\n\n"
        "• Deposit money for a fixed period.\n"
        "• Earn higher interest than a savings account.\n"
        "• Low risk investment."
    ),

    "rd": (
        "💰 Recurring Deposit (RD)\n\n"
        "• Deposit a fixed amount every month.\n"
        "• Earn guaranteed interest.\n"
        "• Helps build disciplined savings."
    ),

    "atm": (
        "🏧 ATM (Automated Teller Machine)\n\n"
        "You can:\n"
        "• Withdraw cash\n"
        "• Check balance\n"
        "• Print mini statement\n"
        "• Change PIN"
    ),

    "debit": (
        "💳 Debit Card\n\n"
        "A Debit Card spends money directly from your bank account.\n\n"
        "You can only spend the money available in your account."
    ),

    "credit": (
        "💳 Credit Card\n\n"
        "A Credit Card lets you borrow money from the bank up to a credit limit.\n\n"
        "The borrowed amount must be repaid before the due date."
    ),

    "default": (
        "🏦 Banking Help\n\n"
        "You can ask me about:\n\n"
        "• NEFT\n"
        "• RTGS\n"
        "• IMPS\n"
        "• UPI\n"
        "• KYC\n"
        "• Fixed Deposit (FD)\n"
        "• Recurring Deposit (RD)\n"
        "• ATM\n"
        "• Debit Card\n"
        "• Credit Card"
    )

}


def get_faq(question: str):

    q = question.lower()

    if "neft" in q:
        return FAQ["neft"]

    if "rtgs" in q:
        return FAQ["rtgs"]

    if "imps" in q:
        return FAQ["imps"]

    if "upi" in q:
        return FAQ["upi"]

    if "kyc" in q:
        return FAQ["kyc"]

    if "fixed deposit" in q or "fd" in q:
        return FAQ["fd"]

    if "recurring deposit" in q or "rd" in q:
        return FAQ["rd"]

    if "atm" in q:
        return FAQ["atm"]

    if "debit" in q:
        return FAQ["debit"]

    if "credit card" in q:
        return FAQ["credit"]

    return FAQ["default"]