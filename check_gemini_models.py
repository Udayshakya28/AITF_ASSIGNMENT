from google import genai
client = genai.Client(api_key="GEMINI_API_KEY")
for model in client.models.list():
    print(model)