import io
import asyncio
import pandas as pd
from typing import List, Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import SentimentAnalyzer
from utils import validate_csv

app = FastAPI(title="Sentiment Analysis API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize sentiment analyzer
sentiment_analyzer = SentimentAnalyzer()

@app.get("/")
async def check_status():
    return {'Success': 'Successfully deployed'}

@app.post("/analyze")
async def analyze_reviews(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Analyze sentiment in product reviews from a CSV file.
    
    The CSV must have a 'review' column containing the text to analyze.
    """
    # Validate file extension
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")
    
    # Read file content
    content = await file.read()
    try:
        # Load CSV data
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Validate CSV structure
        validation_error = validate_csv(df)
        if validation_error:
            raise HTTPException(status_code=400, detail=validation_error)
        
        # Clean data
        df['review'] = df['review'].fillna('').astype(str)
        
        # Analyze sentiment
        results = await sentiment_analyzer.analyze_batch(df['review'].tolist())
        
        # Calculate summary statistics
        positive_count = sum(1 for r in results if r['label'] == 'POSITIVE')
        negative_count = sum(1 for r in results if r['label'] == 'NEGATIVE')
        
        positive_avg_score = 0
        negative_avg_score = 0
        
        if positive_count > 0:
            positive_avg_score = sum(r['score'] for r in results if r['label'] == 'POSITIVE') / positive_count
        
        if negative_count > 0:
            negative_avg_score = sum(r['score'] for r in results if r['label'] == 'NEGATIVE') / negative_count
        
        # Combine review text with results
        df['sentiment'] = [r['label'] for r in results]
        df['confidence'] = [r['score'] for r in results]
        
        # Prepare response
        response = {
            "summary": {
                "positive_count": positive_count,
                "negative_count": negative_count,
                "positive_avg_confidence": positive_avg_score,
                "negative_avg_confidence": negative_avg_score,
                "total_reviews": len(results)
            },
            "reviews": df.to_dict(orient='records')
        }
        
        return response
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)