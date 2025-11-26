from flask import Flask, render_template, flash, request;     
app = Flask(__name__)   # Flask constructor 

@app.route('/')
def index(): 
    try:
        return render_template('index.html')
    except Exception as e:
        return render_template('error.html', error=e), 500