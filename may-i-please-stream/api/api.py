from flask import Flask
from flask import request
import justwatch
from time import sleep
import os
import json

app = Flask(__name__)

# add grandparent directory to path
import sys
sys.path.insert(1, os.path.join(sys.path[0], '../../'))

from MayIPleaseStream import StreamFinder

@app.route('/test', methods=['POST'])
def get_current_test():
    request_data = request.get_json()
    print(request_data)
    director = request_data["search"]
    services = request_data["services"]
    search_mode = request_data["search_mode"].lower()

    assert search_mode in ["director", "actor"], "search_mode must be either 'director' or 'actor'"
    # return request_data

    sf = StreamFinder(services=services)


    if search_mode == "director":
        movies = sf.get_director_movies(director)
    else:
        movies = sf.get_actor_movies(director)

    return sf.make_json(movies)

@app.route('/services', methods=['GET'])
def get_services():
    j = justwatch.JustWatch(country='DK')

    providers = []
    for p in j.get_providers():
        providers.append(p["clear_name"])

    return json.dumps({"names":providers})

if __name__ == '__main__':
    print("Should start server")
    app.run(debug=True)