import json
import re
import os
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

try:
    from openrouter import OpenRouter
    OPENROUTER_AVAILABLE = True
except ImportError:
    OPENROUTER_AVAILABLE = False

try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

class NLPEngine:
    def __init__(self, articles_path: str):
        self.articles_path = articles_path
        self.articles = self._load_articles()
        self.vectorizer = None
        self.tfidf_matrix = None
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        
        if SKLEARN_AVAILABLE and self.articles:
            self._initialize_tfidf()

    def _load_articles(self) -> List[Dict[str, Any]]:
        try:
            with open(self.articles_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading articles: {e}")
            return []

    def _initialize_tfidf(self):
        texts = [f"{a['title']} {a['summary']} {a['content']}" for a in self.articles]
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(texts)

    def search_articles(self, query: str, top_n: int = 3) -> List[Dict[str, Any]]:
        if not self.articles:
            return []
        
        if SKLEARN_AVAILABLE and self.vectorizer:
            query_vec = self.vectorizer.transform([query])
            similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
            # Use native python sorting for indices
            indices = sorted(range(len(similarities)), key=lambda i: similarities[i], reverse=True)[:top_n]
            results = []
            for idx in indices:
                if similarities[idx] > 0.1: # Threshold
                    results.append(self.articles[idx])
            return results
        else:
            # Fallback simple keyword matching (Already native Python)
            query_words = set(query.lower().split())
            matches = []
            for art in self.articles:
                score = 0
                art_text = f"{art['title']} {art['summary']}".lower()
                for word in query_words:
                    if word in art_text:
                        score += 1
                if score > 0:
                    matches.append((score, art))
            matches.sort(key=lambda x: x[0], reverse=True)
            return [m[1] for m in matches[:top_n]]

    def summarize(self, text: str, max_sentences: int = 3) -> str:
        # If OpenRouter is available, use it for a better summary
        if OPENROUTER_AVAILABLE and self.api_key:
            try:
                system_prompt = "You are a legal document summarizer. Summarize the following document in a few bullet points, focusing on key terms, parties involved, and important dates or obligations. Keep it concise."
                with OpenRouter(api_key=self.api_key) as client:
                    response = client.chat.send(
                        model="openrouter/free",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": text[:8000]} # Limit text length for free models
                        ]
                    )
                    return response.choices[0].message.content
            except Exception as e:
                print(f"Summarization Error: {e}")
        
        # Fallback simple extractive summarization
        sentences = re.split(r'(?<=[.!?]) +', text)
        return " ".join(sentences[:max_sentences])

    def extract_text_from_pdf(self, file_path: str) -> str:
        if not PYPDF2_AVAILABLE:
            return "PDF processing library not available."
        
        text = ""
        try:
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting PDF: {e}")
            return f"Error extracting text from PDF: {str(e)}"

    def get_lawbot_response(self, query: str, context_articles: List[Dict[str, Any]], doc_context: str = None) -> str:
        if not OPENROUTER_AVAILABLE or not self.api_key:
            # Fallback to template if API is unavailable
            if not context_articles:
                return "I couldn't find specific articles on that topic. LawBot provides general legal information, not professional legal advice."
            main_ref = context_articles[0]
            summary = self.summarize(main_ref['content'])
            return f"Based on '{main_ref['title']}':\n{summary}\n\nDisclaimer: LawBot provides general legal information, not professional legal advice."

        # Prepare context for the AI
        context_str = "\n\n".join([f"Article: {a['title']}\nContent: {a['content']}" for a in context_articles])
        
        doc_info = f"\n\nUploaded Document Context:\n{doc_context}" if doc_context else ""

        system_prompt = f"""You are 'LawBot', a helpful legal assistant for Indian citizens. 
Your goal is to explain legal, tax, and business concepts in simple, non-technical language.
Use the following articles from our database as your primary source of truth:
{context_str}
{doc_info}

If an uploaded document is provided, prioritize answering based on that document while still using the articles for broader context.
If the context doesn't contain the answer, provide general legal information but state clearly that it's not found in the official articles. 
Always include this disclaimer at the end: 'Disclaimer: LawBot provides general legal information, not professional legal advice.'
Be concise and helpful."""

        try:
            with OpenRouter(api_key=self.api_key) as client:
                response = client.chat.send(
                    model="openrouter/free",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query}
                    ]
                )
                return response.choices[0].message.content
        except Exception as e:
            print(f"OpenRouter Error: {e}")
            return "I'm having trouble connecting to my AI engine. Please try again later. Disclaimer: LawBot provides general legal information, not professional legal advice."

    def extract_keywords(self, text: str) -> List[str]:
        # Simple keyword extraction based on word frequency or capitalization
        words = re.findall(r'\b[A-Z][a-z0-9]+\b', text)
        words = [w for w in words if len(w) > 3]
        return list(set(words))[:5]
