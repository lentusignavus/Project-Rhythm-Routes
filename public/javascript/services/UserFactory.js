(function() {
  'use strict';
  angular.module('app')
    .factory('UserFactory', UserFactory);

  UserFactory.$inject = ['$http', '$q', "$rootScope", "$window"];

  function UserFactory($http, $q, $rootScope, $window) {
    var o = {};

    if(localStorage['spotify-acTokens']){
      $rootScope._spotifyUser = true;
    } else {
      $rootScope._user = isLoggedIn();
    }
    //TOKEN HANDLING----------------------------------------
    function setToken(token) {
      localStorage.setItem("token", token);
    }

    function removeToken() {
      localStorage.removeItem("token");
      localStorage.removeItem("spotify-acTokens");
      localStorage.removeItem("spotify-refTokens");

    }

    function getToken() {
      return localStorage.token;
    }

    function isLoggedIn() {
      var token = getToken();
      if (token) {
        var payload = JSON.parse(urlBase64Decoder(token.split(".")[1]));
        if (payload.exp > Date.now() / 1000) {
          return payload;
        }
      } else {
        return false;
      }
    }

    function urlBase64Decoder(str) {
      var output = str.replace(/-/g, '+').replace(/_/g, '/');
      switch (output.length % 4) {
        case 0:
          {
            break;
          }
        case 2:
          {
            output += '==';
            break;
          }
        case 3:
          {
            output += '=';
            break;
          }
        default:
          throw 'Illegal base64url string'
      }
      return decodeURIComponent(escape($window.atob(output)));
    }



    //USER LOGIN---------------------------------------------------------------

    o.loginUser = function(user) {
      var q = $q.defer();
      $http.post("/api/v1/users/login", user)
        .success(function(res) {
          setToken(res.token);
          $rootScope._user = isLoggedIn();
          q.resolve();
        })
        .error(function(res) {
          q.reject();
        })
      return q.promise;
    }

    //REGISTER A USER---------------------------------------------------------------
    o.registerUser = function(user) {
      var q = $q.defer();
      $http.post("/api/v1/users/register", user)
        .success(function(res) {
          q.resolve(res);
        })
        .error(function(res) {
          q.reject();
        })
      return q.promise;
    }


    //LOGOUT A USER-------------------------------------------------------------------

    o.logout = function() {
      removeToken();
      $rootScope._user = isLoggedIn();
    }

    //------------------------------------------------------------------------------------------
o.delete = function () {
  var q = $q.defer();
  $http.post("/api/v1/users/delete", {_id: $rootScope._user.id})
    .success(function(res) {
      $rootScope._user = isLoggedIn();
      q.resolve();
    })
    .error(function(res) {
      q.reject();
    })
  return q.promise;
}

    //------------------------------------------------------------------------------------------

    return o;
  }
})();
