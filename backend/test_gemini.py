import google.generativeai as genai
genai.configure(api_key="AIzaSyBlI2vkyXuQEqI2Rplojqxt-PV54NnF7CY")
for m in genai.list_models():
    print(m.name)