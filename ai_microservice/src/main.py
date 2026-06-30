import os
import sys
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Set path and import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from chatbot import BankingChatbot

app = FastAPI(title="Secure E-Banking AI Service", version="1.0.0")

# Initialize Chatbot
chatbot = BankingChatbot()

# Store conversation memory
conversation_memory = {}

# Global model placeholders
fraud_model = None
credit_model = None

@app.on_event("startup")
def load_models():
    global fraud_model, credit_model
    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
    
    fraud_path = os.path.join(model_dir, "fraud_model.joblib")
    credit_path = os.path.join(model_dir, "credit_model.joblib")
    
    if os.path.exists(fraud_path):
        try:
            fraud_model = joblib.load(fraud_path)
            print("Loaded fraud model successfully.")
        except Exception as e:
            print(f"Error loading fraud model: {e}")
            
    if os.path.exists(credit_path):
        try:
            credit_model = joblib.load(credit_path)
            print("Loaded credit model successfully.")
        except Exception as e:
            print(f"Error loading credit model: {e}")

# --- Pydantic Schemas ---
class FraudInput(BaseModel):
    amount: float
    senderBalance: float = Field(..., alias="senderBalance")
    receiverBalance: float = Field(..., alias="receiverBalance")
    accountAgeMonths: int = Field(..., alias="accountAgeMonths")
    hourOfDay: int = Field(..., alias="hourOfDay")
    frequency_24h: Optional[int] = 1

    class Config:
        populate_by_name = True

class TransactionItem(BaseModel):
    amount: float
    type: str
    remarks: Optional[str] = ""
    status: str

class SpendingInput(BaseModel):
    transactions: List[TransactionItem]

class ChatInput(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class BudgetInput(BaseModel):
    income: float
    savings_goal: float
    current_spending: float

class CreditInput(BaseModel):
    account_age_months: int
    balance_stability: float
    transaction_count: int
    failed_transactions: int

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "Secure E-Banking AI Microservice"}

@app.post("/predict-fraud")
def predict_fraud_endpoint(data: FraudInput):
    global fraud_model
    
    # Prepare feature array for prediction
    features = pd.DataFrame([{
        "amount": data.amount,
        "sender_balance": data.senderBalance,
        "receiver_balance": data.receiverBalance,
        "account_age_months": data.accountAgeMonths,
        "hour_of_day": data.hourOfDay,
        "frequency_24h": data.frequency_24h
    }])
    
    reasons = []
    
    if fraud_model is not None:
        try:
            # Predict probability
            prob = fraud_model.predict_proba(features)[0][1]
            is_fraud = bool(prob > 0.5)
        except Exception as e:
            print(f"Model prediction failed: {e}. Falling back to rule-based.")
            prob = 0.05
            is_fraud = False
    else:
        # Rule-based fallback if ML model not loaded
        prob = 0.05
        is_fraud = False

    # Supplement or fallback with heuristic rules for explainability
    if data.amount > data.senderBalance * 0.8:
        reasons.append("High transaction amount (exceeds 80% of account balance)")
        prob = max(prob, 0.65)
    if data.amount > 10000 and data.accountAgeMonths < 3:
        reasons.append("Large transaction on recently opened account")
        prob = max(prob, 0.75)
    if data.amount > 5000 and (data.hourOfDay < 5 or data.hourOfDay > 22):
        reasons.append("Large transfer executed during irregular late-night hours")
        prob = max(prob, 0.60)
    if data.frequency_24h and data.frequency_24h > 12:
        reasons.append("Abnormally high transfer frequency in the last 24 hours")
        prob = max(prob, 0.70)
    if data.amount > 100000:
        reasons.append("Extremely high amount transaction limit alert")
        prob = max(prob, 0.90)
        
    is_fraud = prob > 0.5
    
    return {
        "is_fraud": is_fraud,
        "risk_score": float(prob),
        "reasons": reasons if is_fraud else []
    }

@app.post("/spending-analysis")
def spending_analysis_endpoint(data: SpendingInput):
    category_totals = {}
    total = 0.0
    
    for tx in data.transactions:
        if tx.status != "completed":
            continue
        
        amount = tx.amount
        type_ = tx.type
        remarks = tx.remarks.lower() if tx.remarks else ""
        
        # Categorization logic based on remarks & transaction type
        category = "General"
        if "food" in remarks or "restaurant" in remarks or "groceries" in remarks:
            category = "Dining & Groceries"
        elif "rent" in remarks or "utility" in remarks or "electricity" in remarks or "water" in remarks:
            category = "Bills & Utilities"
        elif "shopping" in remarks or "amazon" in remarks or "store" in remarks:
            category = "Shopping"
        elif "travel" in remarks or "uber" in remarks or "flight" in remarks or "gas" in remarks:
            category = "Travel & Transport"
        elif type_ == "transfer":
            category = "Transfers Out"
        elif type_ == "withdraw":
            category = "Cash Withdrawals"
        elif type_ == "deposit":
            continue # Ignore deposits for spending analysis
            
        category_totals[category] = category_totals.get(category, 0.0) + amount
        total += amount

    categories = []
    for cat, amt in category_totals.items():
        categories.append({
            "category": cat,
            "amount": amt,
            "percentage": (amt / total) * 100 if total > 0 else 0
        })
        
    anomalies = []
    # Identify basic spending anomalies
    for cat, amt in category_totals.items():
        if cat in ["Shopping", "Dining & Groceries"] and amt > total * 0.4:
            anomalies.append(f"High discretionary spending: {cat} constitutes over 40% of your expenses.")
    if total > 8000:
        anomalies.append("Elevated spending: Monthly expenditure is higher than average.")

    return {
        "categories": categories,
        "total_spending": total,
        "anomalies": anomalies
    }

@app.post("/chatbot")
def chatbot_endpoint(data: ChatInput):

    context = data.context or {}

    user = context.get("user", {})
    user_id = user.get("username", "guest")

    previous = conversation_memory.get(user_id, {})

    context["memory"] = previous

    reply = chatbot.reply(data.message, context)

    conversation_memory[user_id] = {
        "last_message": data.message,
        "last_intent": chatbot.get_intent(data.message)
    }

    if isinstance(reply, dict):
        return reply

    return {
        "intent": "chat",
        "response": reply
    }

@app.post("/budget-recommendations")
def budget_recommendations_endpoint(data: BudgetInput):
    # 50/30/20 Rule calculations
    necessities_budget = data.income * 0.50
    discretionary_budget = data.income * 0.30
    savings_budget = data.income * 0.20
    
    recommendations = []
    
    # Analyze current spending
    max_spending_limit = data.income - data.savings_goal
    if data.current_spending > max_spending_limit:
        excess = data.current_spending - max_spending_limit
        recommendations.append(
            f"You are overspending. Your current spending of ${data.current_spending:.2f} is "
            f"${excess:.2f} above your target spending ceiling of ${max_spending_limit:.2f}."
        )
        recommendations.append("Action: Limit shopping and luxury categories by 25% this month.")
    else:
        surplus = max_spending_limit - data.current_spending
        recommendations.append(
            f"Excellent! Your spending is well within budget. You have an additional ${surplus:.2f} "
            "available surplus that could be redirected to savings or investments."
        )
        
    if data.savings_goal > necessities_budget:
        recommendations.append(
            "Note: Your savings goal is high (> 50% of income). Ensure essentials are covered first."
        )
    else:
        recommendations.append(
            f"Tip: Set up automated sweeps to transfer ${data.savings_goal:.2f} to your Savings account at the start of each month."
        )

    return {
        "suggested_budgets": [
            {"category": "Essentials (Needs)", "limit": necessities_budget, "percentage": 50},
            {"category": "Lifestyle (Wants)", "limit": discretionary_budget, "percentage": 30},
            {"category": "Financial Goals (Savings)", "limit": savings_budget, "percentage": 20}
        ],
        "recommendations": recommendations
    }

@app.post("/credit-score")
def credit_score_endpoint(data: CreditInput):
    global credit_model
    
    features = pd.DataFrame([{
        "account_age_months": data.account_age_months,
        "balance_stability": data.balance_stability,
        "transaction_count": data.transaction_count,
        "failed_transactions": data.failed_transactions
    }])
    
    if credit_model is not None:
        try:
            score = float(credit_model.predict(features)[0])
        except Exception as e:
            print(f"Credit scoring model failed: {e}. Falling back to default scoring.")
            score = 650.0
    else:
        # Fallback math if ML model not available
        base = 600.0
        base += min(data.account_age_months * 1.5, 120.0)
        base += min(data.balance_stability * 100.0, 100.0)
        base += min(data.transaction_count * 0.15, 80.0)
        base -= min(data.failed_transactions * 55.0, 200.0)
        score = base

    # Clamp credit score between 300 and 850
    final_score = int(max(300, min(score, 850)))
    
    # Rating brackets
    if final_score >= 740:
        rating = "Excellent"
    elif final_score >= 670:
        rating = "Good"
    elif final_score >= 580:
        rating = "Fair"
    else:
        rating = "Poor"
        
    return {
        "credit_score": final_score,
        "rating": rating,
        "details": {
            "account_age_months": data.account_age_months,
            "balance_stability": round(data.balance_stability, 2),
            "transaction_count": data.transaction_count,
            "failed_transactions": data.failed_transactions
        }
    }
