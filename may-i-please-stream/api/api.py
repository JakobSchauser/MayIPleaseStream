from flask import Flask
from flask import request
from time import sleep
import os

app = Flask(__name__)

# add grandparent directory to path
import sys
sys.path.insert(1, os.path.join(sys.path[0], '../../'))

from MayIPleaseStream import StreamFinder

@app.route('/test', methods=['POST'])
def get_current_test():
    request_data = request.get_json()

    director = request_data["search"]
    services = request_data["services"]
    # return request_data
    sf = StreamFinder(services=services)
    return sf.make_json(sf.get_director_movies(director))