from flask import Flask
from sticker import sticker

app = Flask(__name__)

s = "data:image/png;base64," + sticker

head = "<!DOCTYPE html><html><head></head><body>"
footer = "</body></html>"

@app.route("/")
def index():
    
    return head + "<img src=\"" + s + "\" alt=\"sticker\" />" + footer