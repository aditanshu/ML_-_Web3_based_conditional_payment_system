
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re

# Load .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Load API key from environment
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),               # For the api key check the .env folder  , because GROQ_API_KEY is defined there
    base_url="https://api.groq.com/openai/v1"
)

@app.route("/")
def index():
    return jsonify({"msg": "Smart UPI Web3 Backend Running 🚀"})

@app.route("/parse-intent", methods=["POST"])
def parse_intent():
    try:
        data = request.get_json()
        user_input = data.get("text", "")

        if not user_input:
            return jsonify({"error": "No input text provided"}), 400

        # Call Groq Chat API
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an AI that converts payment instructions into structured JSON. Respond ONLY with valid JSON."},
                {"role": "user", "content": f"Convert this instruction into JSON only:\n{user_input}"}
            ],
            temperature=0
        )

        output_text = response.choices[0].message.content.strip()

        # 🧹 Remove ```json ... ``` wrappers if present
        cleaned_text = re.sub(r"^```(?:json)?|```$", "", output_text, flags=re.MULTILINE).strip()

        # Try parsing as JSON
        try:
            output_json = json.loads(cleaned_text)
        except Exception:
            output_json = {"raw_output": cleaned_text}

        return jsonify(output_json)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)