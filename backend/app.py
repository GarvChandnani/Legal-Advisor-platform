from fastapi import FastAPI, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import tempfile

from models.nlp_engine import NLPEngine

app = FastAPI(title="Legal Advisor App API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize NLP Engine
base_path = os.path.dirname(os.path.abspath(__file__))
engine = NLPEngine(os.path.join(base_path, "data", "articles.json"))

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []
    doc_context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    suggested_articles: List[dict]

@app.get("/")
def read_root():
    return {"message": "Legal Advisor App API is running"}

@app.get("/categories")
def get_categories():
    categories = sorted(list(set(a['category'] for a in engine.articles)))
    return categories

@app.get("/articles")
def get_articles(category: Optional[str] = None):
    if category:
        return [a for a in engine.articles if a['category'].lower() == category.lower()]
    return engine.articles

@app.get("/articles/{article_id}")
def get_article(article_id: str):
    article = next((a for a in engine.articles if a['id'] == article_id), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Add related articles
    related = engine.search_articles(article['title'], top_n=3)
    related = [r for r in related if r['id'] != article_id]
    
    return {**article, "related": related}

@app.get("/search")
def search(q: str = Query(...)):
    results = engine.search_articles(q, top_n=5)
    return results

@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Create a temporary file to store the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
        
        # Extract text
        text = engine.extract_text_from_pdf(tmp_path)
        
        # Summarize
        summary = engine.summarize(text)
        
        # Clean up
        os.unlink(tmp_path)
        
        return {
            "filename": file.filename,
            "summary": summary,
            "extracted_text": text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/lawbot", response_model=ChatResponse)
def lawbot_chat(request: ChatRequest):
    # RAG: Search for context from articles
    context_articles = engine.search_articles(request.message, top_n=2)
    
    # Generate response, passing document context if available
    response_text = engine.get_lawbot_response(request.message, context_articles, request.doc_context)
    
    return {
        "response": response_text,
        "suggested_articles": context_articles
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
