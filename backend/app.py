from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@app.route("/")
def home():
    return "AI Business Assistant Backend is running!"


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()

    messages = data.get("messages", [])

    if not messages:
        return jsonify({
            "reply": "Please enter a message."
        })

    try:
        conversation = [
            {
                "role": "developer",
                "content": """
You are an AI Business Assistant.

Help users with:
- freelancing
- business ideas
- marketing
- emails
- social media content
- customer responses
- product descriptions
- website ideas
- general business questions

Give practical, clear and easy-to-understand answers.

Remember previous messages and use the conversation context when answering follow-up questions.
"""
            }
        ]

        for message in messages:

            role = message.get("role")
            text = message.get("text", "")

            if role == "ai":
                role = "assistant"

            if role in ["user", "assistant"]:
                conversation.append({
                    "role": role,
                    "content": text
                })

        response = client.responses.create(
            model="gpt-5.6-luna",
            input=conversation
        )

        return jsonify({
            "reply": response.output_text
        })

    except Exception as error:
        print("AI ERROR:", error)

        return jsonify({
            "reply": "Sorry, something went wrong while contacting the AI server."
        }), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)