from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import pymongo
from bson.objectid import ObjectId
from datetime import datetime
import gridfs
import io
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/notes_sharing_app?retryWrites=true&w=majority")
client = pymongo.MongoClient(MONGODB_URI)
db = client["notes_sharing_app"]
notes_collection = db["notes"]
fs = gridfs.GridFS(db)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/notes', methods=['GET'])
def get_notes():
    query = {}
    
    # Handle search query
    search_query = request.args.get('search', '')
    if search_query:
        query['$or'] = [
            {'title': {'$regex': search_query, '$options': 'i'}},
            {'subject': {'$regex': search_query, '$options': 'i'}},
            {'number': {'$regex': search_query, '$options': 'i'}}
        ]
    
    # Handle subject filter
    subject = request.args.get('subject', '')
    if subject:
        query['subject'] = subject
    
    notes = list(notes_collection.find(query).sort('uploadDate', -1))
    
    # Convert ObjectId to string for JSON serialization
    for note in notes:
        note['_id'] = str(note['_id'])
    
    return jsonify(notes)

@app.route('/api/notes/<note_id>', methods=['GET'])
def get_note(note_id):
    try:
        note = notes_collection.find_one({'_id': ObjectId(note_id)})
        if note:
            note['_id'] = str(note['_id'])
            return jsonify(note)
        return jsonify({'error': 'Note not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notes', methods=['POST'])
def upload_note():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        # Save file to GridFS
        filename = secure_filename(file.filename)
        file_id = fs.put(file, filename=filename)
        
        # Create note document
        note = {
            'title': request.form.get('title'),
            'subject': request.form.get('subject'),
            'number': request.form.get('courseNumber'),
            'description': request.form.get('description', ''),
            'uploadedBy': request.form.get('uploadedBy', 'Anonymous'),
            'uploadDate': datetime.now(),
            'fileName': filename,
            'fileId': str(file_id),
            'fileSize': request.form.get('fileSize', ''),
            'downloadCount': 0
        }
        
        result = notes_collection.insert_one(note)
        note_id = str(result.inserted_id)
        
        return jsonify({'success': True, 'noteId': note_id}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notes/download/<note_id>', methods=['GET'])
def download_note(note_id):
    try:
        note = notes_collection.find_one({'_id': ObjectId(note_id)})
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        # Increment download count
        notes_collection.update_one(
            {'_id': ObjectId(note_id)},
            {'$inc': {'downloadCount': 1}}
        )
        
        # Get file from GridFS
        file_id = ObjectId(note['fileId'])
        grid_out = fs.get(file_id)
        
        # Return file
        return send_file(
            io.BytesIO(grid_out.read()),
            mimetype='application/octet-stream',
            as_attachment=True,
            download_name=note['fileName']
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    subjects = notes_collection.distinct('subject')
    return jsonify(subjects)

if __name__ == '__main__':
    app.run(debug=True)
