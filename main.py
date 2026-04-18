# main.py
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from google import genai
import base64

app = FastAPI()

# Allow your HTML frontend to communicate with this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Client
# GET A FREE KEY HERE: https://aistudio.google.com/app/apikey
client = genai.Client(api_key="GEMINI API KEY HERE")

@app.post("/api/classify")
async def classify_image(image_base64: str = Form(...)):
    try:
        # Clean the base64 string coming from HTML canvas
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        image_bytes = base64.b64decode(image_base64)
        
        # The prompt that tells the AI how to classify the infrastructure
        prompt = """
        Analyze this image of school infrastructure. Classify its condition into EXACTLY ONE of these three words:
        - 'Worst': Roof collapsed, structurally unsafe, immediate danger to students, severe flooding.
        - 'Bad': Needs repair, broken furniture, cracked walls, unhygienic, peeling paint.
        - 'Good': Maintained, safe, minor cosmetic issues, normal classroom.
        Respond ONLY with the single word: Worst, Bad, or Good.
        """
        
        # Send to Gemini Vision model
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                {'mime_type': 'image/jpeg', 'data': image_bytes},
                prompt
            ]
        )
        
        result = response.text.strip()
        
        # Parse result safely
        if "Worst" in result: category = "Worst"
        elif "Bad" in result: category = "Bad"
        else: category = "Good"
        
        return {"success": True, "category": category}
        
    except Exception as e:
        print("Error:", e)
        return {"success": False, "category": "Bad"} # Safe fallback

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)