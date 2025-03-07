from flask import Flask, render_template
from flask_cors import CORS
from backend.api.routes import api
import os
import sys

# Add the parent directory to sys.path
sys.path.append('/Users/chasehitchens/App_Builds/email-agent')

def create_app():
    app = Flask(__name__, 
                static_folder='../frontend/build',
                template_folder='../frontend/build')
    
    # Enable CORS
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')
    
    # Serve React app
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + '/' + path):
            return app.send_static_file(path)
        return render_template("index.html")
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)