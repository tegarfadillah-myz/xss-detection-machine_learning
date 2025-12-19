import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

MODEL_PATH = 'best_naive_bayes_model.pkl'

def generate_model():
    if os.path.exists(MODEL_PATH):
        print(f"Model {MODEL_PATH} already exists.")
        return

    print("Generating dummy model...")
    # Simple dataset for demonstration
    data = pd.DataFrame({
        'text': [
            'hello world',
            '<script>alert(1)</script>',
            'normal text',
            '<img src=x onerror=alert(1)>',
            'how are you',
            'javascript:alert(1)',
            'this is safe',
            '<body onload=alert(1)>'
        ],
        'label': [0, 1, 0, 1, 0, 1, 0, 1] # 0 = Safe, 1 = XSS
    })

    model = make_pipeline(CountVectorizer(), MultinomialNB())
    model.fit(data['text'], data['label'])
    
    joblib.dump(model, MODEL_PATH)
    print(f"Dummy model saved to {MODEL_PATH}")

if __name__ == '__main__':
    generate_model()
