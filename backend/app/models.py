import torch
import asyncio
from typing import List, Dict, Any
from transformers import AutoTokenizer, AutoModelForSequenceClassification

class SentimentAnalyzer:
    def __init__(self, model_name="distilbert-base-uncased-finetuned-sst-2-english", batch_size=16):
        """Initialize the sentiment analyzer with the specified model."""
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.batch_size = batch_size
        
        # Set device (GPU if available, else CPU)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
    
    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """Analyze the sentiment of a single text."""
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            
        scores = torch.nn.functional.softmax(outputs.logits, dim=1)
        sentiment_id = scores.argmax().item()
        
        # Map sentiment ID to label (0 = negative, 1 = positive for SST-2)
        label = "NEGATIVE" if sentiment_id == 0 else "POSITIVE"
        score = scores[0][sentiment_id].item()
        
        return {"text": text, "label": label, "score": score}
    
    async def analyze_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Analyze sentiment for a batch of texts."""
        # Process in smaller batches to avoid memory issues
        results = []
        
        for i in range(0, len(texts), self.batch_size):
            batch_texts = texts[i:i+self.batch_size]
            batch_inputs = self.tokenizer(batch_texts, padding=True, truncation=True, 
                                         max_length=512, return_tensors="pt")
            batch_inputs = {k: v.to(self.device) for k, v in batch_inputs.items()}
            
            with torch.no_grad():
                outputs = self.model(**batch_inputs)
            
            scores = torch.nn.functional.softmax(outputs.logits, dim=1)
            
            for j, text in enumerate(batch_texts):
                sentiment_id = scores[j].argmax().item()
                label = "NEGATIVE" if sentiment_id == 0 else "POSITIVE"
                score = scores[j][sentiment_id].item()
                results.append({"text": text, "label": label, "score": score})
            
            # Small delay to allow other tasks to run
            await asyncio.sleep(0.01)
        
        return results