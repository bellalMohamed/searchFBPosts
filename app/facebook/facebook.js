var app = angular.module('myApp.facebook', ['ngRoute', 'ngFacebook']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/facebook', {
            templateUrl: 'facebook/facebook.html',
            controller: 'facebookController'
        });
}]);

app.config(['$facebookProvider', function($facebookProvider) {
    $facebookProvider.setAppId('166905087093905');
    $facebookProvider.setPermissions('email, public_profile, user_posts, publish_actions, user_photos');
}]);

// FaceBook Graph API Config
app.run(['$rootScope', function($rootScope) {
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
}]);


app.controller('facebookController', ['$scope', '$facebook', '$http', function($scope, $facebook, $http) {
    $scope.allPosts = [];
    $scope.query = "";

    $scope.isLoggedIn = false;
    $scope.login = function() {
        $facebook.login().then(function() {
            console.log('Logged in')
        });
    }

    $scope.logout = function() {
        $facebook.logout().then(function() {
            $scope.isLoggedIn = false;
            getDataFromAPI();
        });
    }


    function getDataFromAPI() {
        $facebook.api('/me', {
            fields: 'id, email, name, gender, locale, last_name, first_name, picture'
        }).then(function(response) {
            $scope.welcomeMessage = "welcome " + response.name;
            $scope.isLoggedIn = true;
            $scope.userInfo = response;
            // console.log(response);

            // Getting Posts
            $facebook.api('me/posts', {
                fields: 'id, message, created_time, full_picture, description, caption, permalink_url, link, sharedposts, story, source',
                limit: 30
            }).then(function(response) {
                console.log(response);
                $scope.posts = response.data;
                $scope.paging = response.paging
                $scope.allPosts.push($scope.posts);
                $scope.next = function() {
                    var next = $scope.paging.next;

                    $http({
                        method: 'GET',
                        url: next
                    }).then(function(response) {
                        console.log(response)

                        $scope.posts = response.data.data;
                        $scope.paging = response.data.paging;
                        $scope.allPosts.push(response.data.data);

                        console.log($scope.allPosts);

                        if ($scope.allPosts[$scope.allPosts.length - 1].length != []) {
                            $scope.next();
                        }
                    });
                }
            });
        }, function(error) {
            $scope.welcomeMessage = "please LogIN";
            console.log($error);
        });
    }
    getDataFromAPI();
}]);