import google.generativeai as genai
from PIL import Image

genai.configure(api_key="AIzaSyDDojSnsA4ziqK6eCQHvDP4KptJdL7kDrM")
model = genai.GenerativeModel("gemini-pro-vision")
img = Image.open("C:\Users\ASUS\OneDrive\Pictures\tiger.jpg")
response = model.generate_content(["Describe this image", img])
print(response.text)