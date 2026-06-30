import re


def parse_transfer_request(message: str):
    """
    Extract amount and receiver account number.

    Examples:
        Transfer 5000 to 1234567890
        Send ₹2500 to 9876543210
        Pay 1000 to 1111222233
    """

    msg = message.lower().replace(",", "")

    amount_match = re.search(r"(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)", msg)

    receiver_match = re.search(r"to\s+(\d{10})", msg)

    amount = None
    receiver = None

    if amount_match:
        amount = float(amount_match.group(1))

    if receiver_match:
        receiver = receiver_match.group(1)

    return {
        "amount": amount,
        "receiver": receiver
    }