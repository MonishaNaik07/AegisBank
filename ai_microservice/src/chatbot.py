"""
chatbot.py
Main chatbot router.
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from intents import INTENT_QUERIES
from responses import RESPONSES
from banking_service import (
    get_balance,
    get_recent_transactions,
    get_monthly_summary,
    get_spending_analysis,
    get_savings_goal,
)
from financial_tips import get_financial_tip
from faq import get_faq
from transfer_parser import parse_transfer_request

class BankingChatbot:

    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.queries = []
        self.intents = []

        for intent, samples in INTENT_QUERIES.items():
            for sample in samples:
                self.queries.append(sample.lower())
                self.intents.append(intent)

        self.matrix = self.vectorizer.fit_transform(self.queries)

    def get_intent(self, message: str):

        vector = self.vectorizer.transform([message.lower()])
        similarities = cosine_similarity(vector, self.matrix)[0]

        idx = np.argmax(similarities)

        if similarities[idx] < 0.20:
            return "unknown"

        return self.intents[idx]
    
    def handle_transfer_request(self, message):

        data = parse_transfer_request(message)

        amount = data.get("amount")
        receiver = data.get("receiver")

        if amount is None:
            return {
                "intent": "transfer_money",
                "status": "missing_amount",
                "response": "How much money would you like to transfer?"
            }

        if receiver is None:

            return {
                "intent": "transfer_money",
                "status": "missing_receiver",
                "amount": amount,
                "response":
                    f"""Amount detected

        ₹{amount:.2f}

        Please enter the receiver's 10-digit account number."""
            }
            
        if amount <= 0:

            return {
                "intent": "transfer_money",
                "status": "invalid_amount",
                "response": "Transfer amount must be greater than zero."
            }

        return {
            "intent": "transfer_money",
            "status": "ready",
            "amount": amount,
            "receiver": receiver,
            "response":
                f"""🏦 AegisBank AI Transfer Assistant

                Please review the transfer details.

                ━━━━━━━━━━━━━━━━━━━━

                💰 Amount

                ₹{amount:.2f}

                👤 Receiver

                {receiver}

                ━━━━━━━━━━━━━━━━━━━━

                Reply

                YES

                to proceed.

                Reply

                CANCEL

                to abort."""
        }

    def reply(self, message, context=None):

        intent = self.get_intent(message)
        
        if intent == "transfer_money":

            transfer = self.handle_transfer_request(message)

            memory = context.get("memory", {})

            if transfer["status"] == "missing_receiver":

                memory["pending_amount"] = transfer["amount"]

            return transfer

        if context is None:
            context = {}

        user = context.get("user", {})
        name = user.get("fullName", "Customer")

        if intent == "greeting":
            return RESPONSES["greeting"].format(name=name)

        if intent == "farewell":
            return RESPONSES["farewell"]

        if intent == "balance":
            return get_balance(context)

        if intent == "transactions":
            return get_recent_transactions(context)

        if intent == "summary":
            return get_monthly_summary(context)

        if intent == "spending":
            return get_spending_analysis(context)

        if intent == "goal":
            return get_savings_goal(context)

        if intent == "tips":
            return get_financial_tip(context)

        if intent == "transfer":
            return RESPONSES["transfer_help"]

        if intent == "fraud":
            txns = context.get("recentTransactions", [])
            fraud = sum(1 for t in txns if t.get("isFraudulent"))
            if fraud:
                return RESPONSES["security_alert"].format(count=fraud)
            return RESPONSES["security_safe"]

        if intent == "faq":
            return get_faq(message)

        return RESPONSES["unknown"]
