from justwatch import JustWatch
from imdb import Cinemagoer


class StreamFinder():
    def __init__(self, services = []) -> None:
        self.just_watch = JustWatch(country='DK')
        self.ia = Cinemagoer()
        
        self.my_services = []

        # possible = ["Netflix","Filmstriben", "Disney+", "HBO MAX", "Prime Video", "Sky Showtime", "Viaplay"]
        possible = []
        short_names = []
        for p in self.just_watch.get_providers():
            possible.append(p["clear_name"])
            short_names.append(p["short_name"])


        for i in range(len(services)):
            if services[i]:
                self.my_services.append(possible[i])


        self.readable2short = dict(zip(possible, short_names))

        self.short2readable = {v: k for k, v in self.readable2short.items()}

        genres = self.just_watch.get_genres()

        self.readablegenre2short = dict(zip([genre["technical_name"] for genre in genres], [genre["short_name"] for genre in genres]))
        self.readable_genres = [genre["technical_name"] for genre in genres]

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


    def can_watch_on_my_services(self, movie_name):
        movie_services = self.get_streaming_services(movie_name)
        my_services_names = [self.readable2short[service] for service in self.my_services]
        return filter(lambda service: service in movie_services, my_services_names)


    def get_watchable_movies(self, movies):
        movies = [movie["title"] for movie in movies]
        watchable_movies = []

        for movie in movies:
            services = list(self.can_watch_on_my_services(movie))
            if len(services) > 0:

                services_names = ", ".join(self.short2readable[service] for service in services)
                watchable_movies.append((movie, services_names))

        return watchable_movies

    def get_director_movies(self, director):
        filmography = self.ia.get_person(self.ia.search_person(director)[0].personID)['filmography']["director"]
        return self.get_watchable_movies(filmography)

    def make_json(self, movies):
        return [{"title": movie[0], "services": movie[1]} for movie in movies]
    def get_actor_movies(self, actor):
        filmography = self.ia.get_person(self.ia.search_person(actor)[0].personID)['filmography']["actor"]
        return self.get_watchable_movies(filmography)

    def prettyprint(self, movies):
        for movie in movies:
            print(movie[0] + " (" + str(movie[1]) + ")")

    def get_top_in_genre(self, genre):
        # top_in_genre = self.ia.get_top50_movies_by_genres(genre)
        if genre not in self.readablegenre2short.keys() or genre not in self.readablegenre2short.values():
            return set([])
        
        if genre in self.readablegenre2short.keys():
            genre = self.readablegenre2short[genre]
            
        results_by_genre = self.just_watch.search_for_item(providers =[v for k, v in self.readable2short.items()], content_types=['movie'], genres=['hrr'])["items"]
        return self.get_watchable_movies(results_by_genre)

    def get_from_list(self, list_id):
        movie_list = self.ia.get_movie_list("ls073612625")

        if len(movie_list) < 1:
            return set([])

        if len(movie_list) > 25:
            movie_list = movie_list[:25]

        return self.get_watchable_movies(movie_list)
