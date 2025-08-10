from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import os
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# Function to get Gemini response (updated to clearly handle None for image)
def get_gemini_response(input_text, image_data=None):
    model = genai.GenerativeModel('gemini-1.5-flash')
    contents = []
    if input_text:
        contents.append(input_text)
    if image_data: # Only append image if it's not None
        contents.append(image_data)

    if not contents:
        # This case should ideally be caught on the frontend
        # or be considered an invalid request if neither text nor image is provided.
        # For now, return a default message or raise an error.
        return "Please provide text or an image."

    response = model.generate_content(contents)
    return response.text

@app.post("/process-message/") # Make sure this endpoint name matches in React
async def process_message(
    prompt: str = Form(""), # Text field
    file: UploadFile = File(None) # Optional file field
):
    image = None
    if file and file.filename: # Check if a file was actually provided (even if optional)
        try:
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            # If a file was sent but couldn't be processed, raise an error
            raise HTTPException(status_code=400, detail=f"Could not process image: {e}")

    try:
        # Call Gemini with the prompt and the processed image (which can be None)
        gemini_output = get_gemini_response(prompt, image)
        return JSONResponse(content={"response": gemini_output})
    except Exception as e:
        # Catch any errors from Gemini API or processing
        raise HTTPException(status_code=500, detail=f"Gemini API error: {e}")

@app.get("/")
async def read_root():
    return {"message": "Gemini Chatbot API is running!"}