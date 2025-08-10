import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

try:
    model = genai.GenerativeModel("gemini-2.0-flash-lite-001")
    chat = model.start_chat(history=[])
    response = chat.send_message("Hello Gemini!", stream=True)
    print("Gemini response:")
    for chunk in response:
        print(chunk.text, end="")
except Exception as e:
    print("Error:", e)