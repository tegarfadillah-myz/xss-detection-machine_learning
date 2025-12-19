from flask import Flask, request, jsonify
import joblib
import os
from generate_dummy_model import generate_model

app = Flask(__name__)
MODEL_PATH = 'best_naive_bayes_model.pkl'
model = None

def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        generate_model()
    
    try:
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        load_model()
        if not model:
            return jsonify({'error': 'Model not available'}), 500

    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    text = data['text']
    try:
        prediction = model.predict([text])[0]
        # Assuming 1 is XSS, 0 is Safe
        result = "XSS Detected" if prediction == 1 else "Safe"
        return jsonify({'prediction': result, 'class': int(prediction)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_model()
    app.run(host='0.0.0.0', port=5000)
