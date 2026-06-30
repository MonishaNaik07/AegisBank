import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

# Ensure directory for models exists
os.makedirs("models", exist_ok=True)

def train_fraud_model():
    print("Generating synthetic data for fraud detection...")
    np.random.seed(42)
    n_samples = 10000

    # Features:
    # 1. amount (1 to 20,000)
    # 2. sender_balance (0 to 500,000)
    # 3. receiver_balance (0 to 500,000)
    # 4. account_age_months (1 to 120)
    # 5. hour_of_day (0 to 23)
    # 6. frequency_24h (1 to 50)
    
    amount = np.random.exponential(scale=1500, size=n_samples) + 1
    sender_balance = np.random.uniform(10, 300000, n_samples)
    receiver_balance = np.random.uniform(10, 300000, n_samples)
    account_age_months = np.random.randint(1, 120, n_samples)
    hour_of_day = np.random.randint(0, 24, n_samples)
    frequency_24h = np.random.poisson(lam=3, size=n_samples) + 1

    # Create target (is_fraud) based on rules with noise
    is_fraud = np.zeros(n_samples, dtype=int)
    
    for i in range(n_samples):
        score = 0.0
        # Rule 1: High transfer amount relative to sender balance
        if amount[i] > sender_balance[i] * 0.8:
            score += 0.4
        # Rule 2: Large transactions from brand new accounts
        if amount[i] > 10000 and account_age_months[i] < 3:
            score += 0.5
        # Rule 3: Late night large transactions
        if amount[i] > 5000 and (hour_of_day[i] < 5 or hour_of_day[i] > 22):
            score += 0.3
        # Rule 4: Suspiciously high frequency of transfers
        if frequency_24h[i] > 12:
            score += 0.4
        # Rule 5: Extremely large transaction
        if amount[i] > 100000:
            score += 0.8

        # Probabilistic labeling based on computed risk score
        prob = min(0.99, max(0.01, score))
        is_fraud[i] = np.random.choice([0, 1], p=[1 - prob, prob])

    # Convert to DataFrame
    df = pd.DataFrame({
        "amount": amount,
        "sender_balance": sender_balance,
        "receiver_balance": receiver_balance,
        "account_age_months": account_age_months,
        "hour_of_day": hour_of_day,
        "frequency_24h": frequency_24h,
        "is_fraud": is_fraud
    })

    X = df.drop("is_fraud", axis=1)
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(f"Fraud Model - Train Accuracy: {train_acc:.4f}, Test Accuracy: {test_acc:.4f}")

    joblib.dump(model, "models/fraud_model.joblib")
    print("Fraud model saved to models/fraud_model.joblib")

def train_credit_model():
    print("Generating synthetic data for credit scoring...")
    np.random.seed(42)
    n_samples = 5000

    # Features:
    # 1. account_age_months (1 to 120)
    # 2. balance_stability (0.0 to 1.0, where 1.0 is extremely stable)
    # 3. transaction_count (0 to 1000)
    # 4. failed_transactions (0 to 20)

    account_age_months = np.random.randint(1, 120, n_samples)
    balance_stability = np.random.uniform(0.0, 1.0, n_samples)
    transaction_count = np.random.randint(5, 800, n_samples)
    failed_transactions = np.random.poisson(lam=0.5, size=n_samples)

    # Output: Credit score (300 to 850)
    credit_score = 600 + (account_age_months * 1.25) + (balance_stability * 100) + (np.minimum(transaction_count * 0.1, 50)) - (failed_transactions * 60)
    credit_score = np.clip(credit_score + np.random.normal(0, 15, n_samples), 300, 850)

    df = pd.DataFrame({
        "account_age_months": account_age_months,
        "balance_stability": balance_stability,
        "transaction_count": transaction_count,
        "failed_transactions": failed_transactions,
        "credit_score": credit_score
    })

    X = df.drop("credit_score", axis=1)
    y = df["credit_score"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)

    train_r2 = model.score(X_train, y_train)
    test_r2 = model.score(X_test, y_test)
    print(f"Credit Model - Train R2: {train_r2:.4f}, Test R2: {test_r2:.4f}")

    joblib.dump(model, "models/credit_model.joblib")
    print("Credit model saved to models/credit_model.joblib")

if __name__ == "__main__":
    train_fraud_model()
    train_credit_model()
    print("All models trained and saved successfully!")
