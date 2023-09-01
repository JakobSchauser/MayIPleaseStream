from justwatch import JustWatch
# from imdb import Cinemagoer
from PyMovieDb import IMDB
from time import sleep
import threading

class StreamFinder():
    def __init__(self) -> None:
        self.just_watch = JustWatch(country='DK')
        # self.ia = Cinemagoer()
        self.imdb = IMDB()
        # self.my_services = []

        # possible = ["Netflix","Filmstriben", "Disney+", "HBO MAX", "Prime Video", "Sky Showtime", "Viaplay"]
        possible = []
        short_names = []
        for p in self.just_watch.get_providers():
            possible.append(p["clear_name"])
            short_names.append(p["short_name"])


        # for i in range(len(services)):
        #     if services[i]:
        #         self.my_services.append(possible[i])
        
        self.readable2short = dict(zip(possible, short_names))

        self.short2readable = {v: k for k, v in self.readable2short.items()}

        genres = self.just_watch.get_genres()

        self.readablegenre2short = dict(zip([genre["technical_name"] for genre in genres], [genre["short_name"] for genre in genres]))
        self.readable_genres = [genre["technical_name"] for genre in genres]

        self.cache = {"test_category": {"test_person1":"test_value", "test_person2":"test2"}}

        # self.reset_cache()
        self.cache_thread = threading.Thread(target=self.reset_cache)
        self.cache_thread.start()

        self.time_between_refresh = 60*60*24*7 # 1 week

    def get_full_cache(self):
        return self.cache

    def get_cached(self, search_term, search_mode):
        if (search_term,search_mode) in self.cache:
            return self.cache[(search_term,search_mode)]
        return None
    
    def cache_result(self, search_term, search_mode, result):
        self.cache[(search_term, search_mode)] = result

    def reset_cache(self):
        print("Rebuilding cache")
        self.cache["director"] = {}
        # sleep(5)
        self.cache["director"]["david lynch"] = [["0"], []]

        for director in ["david lynch", "stanley kubrick", "quentin tarantino", "alfred hitchcock", "christopher nolan", "martin scorsese", "steven spielberg", "ridley scott", "james cameron", "francis ford coppola", "clint eastwood", "tim burton", "wes anderson", "danny boyle", "david fincher", "peter jackson", "roman polanski", "terrence malick", "michael bay", "michael moore", "michael haneke"]:
            self.cache["director"][director] = [["1"], []]
            # movies = self.ia.get_person(self.ia.search_person(director)[0].personID)['filmography']["director"]
            movies = self.imdb.get_director_movies(director)
            self.cache["director"][director] = [["2"], []]
            movies = [movie["title"] for movie in movies]
            self.cache["director"][director] = [["3"], []]
            services = [list(self.get_streaming_services(movie)) for movie in movies]
            self.cache["director"][director] = [["4"], []]
            true_movies = []
            true_services = []
            for movie, service in zip(movies, services):
                if len(service) > 0:
                    true_movies.append(movie)
                    true_services.append(service)

            self.cache["director"][director] = [["5"], []]
            

            self.cache["director"][director] = [true_movies, true_services]
            # sleep(5)

        print("Directors done")
        # for genre in self.readable_genres:
        #     # movies = self.just_watch.search_for_item(providers = [self.readable2short.values()], content_types=['movie'], genres=[self.readablegenre2short[genre]])["items"]
        #     # movies = [movie["title"] for movie in movies]
        #     # services = [self.get_streaming_services(movie) for movie in movies]
        #     self.cache[(genre, "genre")] = "test"#(movies, services)
        #     sleep(5)
        # print("Genres done")

        print("Ready to serve!")
        sleep(self.time_between_refresh)
        self.reset_cache()

    def get_services(self):
        return list(self.readable2short.keys())
    
    def get_genres(self):
        return self.readable_genres
    

    def get_streaming_services(self, movie_name):
        results = self.just_watch.search_for_item(query=movie_name, content_types=['movie'])
        if len(results["items"]) < 1 or 'offers' not in results['items'][0]:
            return set([])

        name_justwatch = results["items"][0]["title"].lower()
        name = movie_name.lower()
        p_words_correct_1 = sum(a in name_justwatch for a in name.split(" "))/len(name.split(" "))
        p_words_correct_2 = sum(a in name for a in name_justwatch.split(" "))/len(name_justwatch.split(" "))

        if p_words_correct_1 + p_words_correct_2 < 2*0.9:
            return set([])
            
        offers = results['items'][0]['offers']
        # print(results['items'][0]['title'])
        services = filter(lambda x: x['monetization_type'] == 'flatrate', offers)
        names = map(lambda x: x['package_short_name'], services)
        return set(names)


    def can_watch_on_my_services(self, movie_services, services):
        my_services_names = [self.readable2short[service] for service in services]
        return filter(lambda service: service in movie_services, my_services_names)


    def get_watchable_movies(self, movie_titles, movie_servicess, services):
        watchable_movies = []

        for movie, movie_services in zip(movie_titles, movie_servicess):
            _services = list(self.can_watch_on_my_services(movie_services, services))
            if len(_services) > 0:
                services_names = ", ".join(self.short2readable[service] for service in _services)
                watchable_movies.append((movie, services_names))

        return watchable_movies


    def get_cache_movies(self, search_term, search_type, services):
        if search_term not in self.cache[search_type]:
            return set([])
        
        movies, movie_services = self.cache[search_type][search_term]

        return self.get_watchable_movies(movies, movie_services, services)

    def make_json(self, movies):
        return [{"title": movie[0], "services": movie[1]} for movie in movies]
    

    def prettyprint(self, movies):
        for movie in movies:
            print(movie[0] + " (" + str(movie[1]) + ")")

    # def get_top_in_genre(self, genre, services):
    #     # top_in_genre = self.ia.get_top50_movies_by_genres(genre)
    #     if genre not in self.readablegenre2short.keys() or genre not in self.readablegenre2short.values():
    #         return set([])
        
    #     if (genre, "genre") in self.cache:
    #         results_by_genre = self.cache[(genre, "genre")]
    #     else:
    #         if genre in self.readablegenre2short.keys():
    #             genre = self.readablegenre2short[genre]
    #         results_by_genre = self.just_watch.search_for_item(providers =[v for k, v in self.readable2short.items()], content_types=['movie'], genres=['hrr'])["items"]
    #         self.cache[(genre, "genre")] = results_by_genre

    #     return self.get_watchable_movies(results_by_genre, services)

    # def get_from_list(self, list_id):
    #     movie_list = self.ia.get_movie_list("ls073612625")

    #     if len(movie_list) < 1:
    #         return set([])

    #     if len(movie_list) > 25:
    #         movie_list = movie_list[:25]

    #     return self.get_watchable_movies(movie_list)
