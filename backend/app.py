from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from groq import Groq

# ================= INIT =================
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("⚠️ WARNING: GROQ_API_KEY not found in .env")

client = Groq(api_key=GROQ_API_KEY)

app = Flask(__name__)
CORS(app)

# ================= FILE PATHS =================
DATA_FOLDER = "data"
os.makedirs(DATA_FOLDER, exist_ok=True)

STOCK_FILE = os.path.join(DATA_FOLDER, "stock.csv")
DISPENSE_FILE = os.path.join(DATA_FOLDER, "dispensing.csv")
HISTORY_FILE = os.path.join(DATA_FOLDER, "history.csv")

# ================= INIT CSV =================
for file_path, columns in [
    (STOCK_FILE, ["Medicine", "Batch_No", "Expiry_Date", "Quantity"]),
    (DISPENSE_FILE, ["Medicine", "Batch_No", "Quantity"]),
    (HISTORY_FILE, ["Type", "FileName", "Timestamp"])
]:
    if not os.path.exists(file_path):
        pd.DataFrame(columns=columns).to_csv(file_path, index=False)

# ================= CSV HELPERS =================
def read_csv(file):
    try:
        return pd.read_csv(file)
    except:
        return pd.DataFrame()

def save_csv(df, file):
    df.to_csv(file, index=False)

# ================= HISTORY =================
def log_history(file_type, filename):
    df = read_csv(HISTORY_FILE)

    new_entry = {
        "Type": file_type,
        "FileName": filename,
        "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)
    save_csv(df, HISTORY_FILE)

@app.route("/history", methods=["GET"])
def history():
    df = read_csv(HISTORY_FILE)
    return jsonify(df.fillna("").to_dict(orient="records"))

@app.route("/delete-history/<int:index>", methods=["DELETE"])
def delete_history(index):
    try:
        df = read_csv(HISTORY_FILE)

        if df.empty:
            return jsonify({"error": "History empty"}), 400

        if index < 0 or index >= len(df):
            return jsonify({"error": "Invalid index"}), 400

        df = df.drop(index)
        df.reset_index(drop=True, inplace=True)
        save_csv(df, HISTORY_FILE)

        return jsonify({"message": "Deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/clear-history", methods=["DELETE"])
def clear_history():
    pd.DataFrame(columns=["Type", "FileName", "Timestamp"]).to_csv(HISTORY_FILE, index=False)
    return jsonify({"message": "All history cleared"})

# ================= INVENTORY =================
@app.route("/inventory", methods=["GET"])
def inventory():
    df = read_csv(STOCK_FILE)
    return jsonify(df.fillna("").to_dict(orient="records"))

# ================= ADD STOCK =================
@app.route("/add-stock", methods=["POST"])
def add_stock():
    try:
        data = request.get_json()
        df = read_csv(STOCK_FILE)

        new_entry = {
            "Medicine": data["name"],
            "Batch_No": data["batch"],
            "Expiry_Date": data["expiry"],
            "Quantity": int(data["quantity"])
        }

        df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)
        save_csv(df, STOCK_FILE)

        log_history("manual-stock", data["name"])

        return jsonify({"message": "Stock added"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= ADD DISPENSE =================
@app.route("/add-dispense", methods=["POST"])
def add_dispense():
    try:
        data = request.get_json()

        stock_df = read_csv(STOCK_FILE)
        disp_df = read_csv(DISPENSE_FILE)

        medicine = data["name"]
        batch = data["batch"]
        qty = int(data["quantity"])

        mask = (stock_df["Medicine"] == medicine) & (stock_df["Batch_No"] == batch)

        if not mask.any():
            return jsonify({"error": "Batch not found"}), 400

        idx = stock_df[mask].index[0]

        if stock_df.at[idx, "Quantity"] < qty:
            return jsonify({"error": "Not enough stock"}), 400

        stock_df.at[idx, "Quantity"] -= qty
        save_csv(stock_df, STOCK_FILE)

        new_disp = {
            "Medicine": medicine,
            "Batch_No": batch,
            "Quantity": qty
        }

        disp_df = pd.concat([disp_df, pd.DataFrame([new_disp])], ignore_index=True)
        save_csv(disp_df, DISPENSE_FILE)

        log_history("manual-dispense", medicine)

        return jsonify({"message": "Dispensed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= FILE UPLOAD =================
@app.route("/upload-stock", methods=["POST"])
def upload_stock():
    try:
        file = request.files["file"]
        filename = secure_filename(file.filename)

        file.save(STOCK_FILE)

        log_history("stock-upload", filename)

        return jsonify({"message": "Stock uploaded"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/upload-dispensing", methods=["POST"])
def upload_dispensing():
    try:
        file = request.files["file"]
        filename = secure_filename(file.filename)

        file.save(DISPENSE_FILE)

        log_history("dispense-upload", filename)

        return jsonify({"message": "Dispensing uploaded"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= AI ANALYSIS =================
@app.route("/ai-analysis", methods=["POST"])
def ai_analysis():
    try:
        data = request.get_json()
        inventory_data = data.get("inventory_context", [])

        if not inventory_data:
            return jsonify({"analysis": "No inventory data provided."})

        stock_text = "\n".join([
            f"{i.get('Medicine')} - Qty: {i.get('Quantity')} - Exp: {i.get('Expiry_Date')}"
            for i in inventory_data
        ])

        prompt = f"""
        You are a hospital inventory expert.

        Analyze:
        {stock_text}

        Provide:
        - Critical shortages
        - Expiry risks
        - Restock advice
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )

        return jsonify({
            "analysis": response.choices[0].message.content
        })

    except Exception as e:
        print("AI ERROR:", e)
        return jsonify({
            "analysis": "AI service unavailable. Check API key."
        }), 500

# ================= AI CHAT =================
@app.route("/medicine-chat", methods=["POST"])
def medicine_chat():
    try:
        data = request.get_json()
        question = data.get("question", "")
        inventory_data = data.get("inventory_context", [])

        if not question:
            return jsonify({"answer": "Ask a question."})

        stock_text = "\n".join([
            f"{i.get('Medicine')} (Qty: {i.get('Quantity')})"
            for i in inventory_data
        ])

        prompt = f"""
        Inventory:
        {stock_text}

        Question:
        {question}

        Answer briefly.
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )

        return jsonify({
            "answer": response.choices[0].message.content
        })

    except Exception as e:
        print("CHAT ERROR:", e)
        return jsonify({
            "answer": "AI communication failed."
        }), 500

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)