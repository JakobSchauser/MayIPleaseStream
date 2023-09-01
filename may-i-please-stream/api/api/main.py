from flask import Flask
from flask import request
import justwatch
from time import sleep
import os
import threading
import json
from flask_cors import CORS, cross_origin


from MayIPleaseStream import StreamFinder

#making a small change to push
app = Flask(__name__)
cors = CORS(app, supports_credentials=True)
# app.config['CORS_HEADERS'] = 'Content-Type'
# # add grandparent directory to path
# import sys
# sys.path.insert(1, os.path.join(sys.path[0], '../../'))



j = justwatch.JustWatch(country='DK')
sf = StreamFinder()

providers = sf.get_services()

@app.route('/', methods=['GET'])
def main_page():
    return "Hello World!"

@app.route('/cache', methods=['GET'])
def get_cache():
    # return json.dumps(sf.get_full_cache())
    return sf.get_full_cache()

@app.route('/test', methods=['POST'])
# @cross_origin()
def get_current_test():
    global sf
    request_data = request.get_json()
    print(request_data)
    search_term = request_data["search"].lower()
    services = request_data["services"]
    search_mode = request_data["search_mode"].lower()

    assert search_mode in ["director", "actor", "genre"], "search_mode must be either 'director', 'actor' or 'genre'"
    # return request_data

    # if (search_term,search_mode) in cache:
    #     return cache[(search_term,search_mode)]
    movies = sf.get_cache_movies(search_term, search_mode, services)
    # if search_mode == "director":
    #     movies = sf.get_director_movies(search_term, services)
    # elif search_mode == "actor":
    #     movies = sf.get_actor_movies(search_term, services)
    # elif search_mode == "genre":
    #     movies = sf.get_top_in_genre(search_term, services)

    return sf.make_json(movies)

@app.route('/services', methods=['GET'])
# @cross_origin()
def get_services():
    global providers

    return json.dumps({"names":providers})

if __name__ == '__main__':
    print("Should start server")
    # refresh_cache()
    # threading.Thread(target=refresh_cache).start()
    app.run(debug=True)