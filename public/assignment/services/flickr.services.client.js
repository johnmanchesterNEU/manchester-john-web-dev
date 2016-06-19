(function(){
    angular
        .module("WebAppMaker")
        .factory("FlickrService", FlickrService);

    var key = "5945b70543024e62a8512ca84fcf57ad";
    var secret = "f8572ad8b0e19099";
    var urlBase = "https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&api_key=API_KEY&text=TEXT";

    function FlickrService($http) {
        var api = {
            searchPhotos: searchPhotos,
        };
        return api;

        function searchPhotos(searchTerm){
            console.log(searchTerm);
            var url = urlBase.replace("API_KEY", key).replace("TEXT", searchTerm);
            console.log(url);
            return $http.get(url);
        }
    }
})();

/*(function(){
    angular
        .module("WebAppMaker")
        .factory("FlickrService", FlickrService);

    function FlickrService($http) {
        var api = {
            searchPhotos: searchPhotos,
        };
        return api;
//Key:5945b70543024e62a8512ca84fcf57ad

//Secret:f8572ad8b0e19099
        var key = 5945b70543024e62a8512ca84fcf57ad;
        var seccret= f8572ad8b0e19099;

        function searchPhotos(searchText){
        }
    }
})();*/