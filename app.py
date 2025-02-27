from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
import pytesseract
from PIL import Image
import time

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure the upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    # List all files in the upload folder
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    return render_template('index.html', files=files)

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return redirect(request.url)
    
    files = request.files.getlist('file')  # Get multiple files
    extracted_texts = []

    for file in files:
        if file.filename == '':
            continue
        
        # Save the uploaded file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        
        # Extract text using OCR
        try:
            image = Image.open(filepath)
            extracted_text = pytesseract.image_to_string(image)
            extracted_texts.append(extracted_text)
        except Exception as e:
            return f"Error processing image: {str(e)}"
    
    combined_text = "\n".join(extracted_texts)  # Combine all texts
    return render_template('reader.html', text=combined_text)

@app.route('/summary', methods=['POST'])
def summary():
    data = request.json
    duration = data.get('duration')
    word_count = data.get('word_count')
    return jsonify({
        "message": f"You read {word_count} words in {duration:.2f} seconds."
    })

if __name__ == '__main__':
    app.run(debug=True)