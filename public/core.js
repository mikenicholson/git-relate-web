var isNewer = angular.module('isnewer', []);

isNewer.controller('mainController', function ($scope, $http) {
    var DEFAULT_BANNER = "Enter two commits to compare them"
    $scope.formData = {};
    $scope.result = null;
    $scope.commit1 = null;
    $scope.commit2 = null;
    $scope.bannerMessage = DEFAULT_BANNER;

    $scope.checkIsNewer = function(callback) {
        $http.post('/api/isnewer', $scope.formData)
            .success(function(data) {
                ancestor = $scope.formData.ancestor;
                descendant = $scope.formData.descendant;
                console.log(data);
                callback(ancestor, descendant, data.result);
            })
            .error(function(data) {
                console.log("Error: " + data);
            });
    };


    $scope.updateRelationship = function() {
        console.log("Inside update relationship");
        if ($scope.commit1 && $scope.commit2) {
            console.log("Do have both commits.");
            $scope.checkIsNewer(function(ancestor, descendant, result) {
                if (result) {
                    $scope.bannerMessage = descendant + " is newer than " + ancestor;
                } else {
                    $scope.bannerMessage = descendant + " is not newer than " + ancestor;
                }
            });
        } else {
            $scope.bannerMessage = DEFAULT_BANNER;
            $scope.result = null;
            console.log("Don't have both commits");
        }
    };


    $scope.updateAncestor = function() {
        var ancestor = $scope.formData.ancestor;
        console.log("UpdateAncestor called with: " + ancestor);
        $scope.tryLookupRev(ancestor, function(commit_data) {
            $scope.commit1 = commit_data;
            $scope.updateRelationship();
        });
    };


    $scope.updateDescendant = function() {
        var descendant = $scope.formData.descendant;
        console.log('UpdateDescendant called with' + descendant);
        $scope.tryLookupRev(descendant, function(commit_data) {
            $scope.commit2 = commit_data;
            $scope.updateRelationship();
        });
    };


    $scope.tryLookupRev = function(rev_name, callback) {
        if (rev_name && rev_name.length > 0) {
            $http.get('/api/commit/' + rev_name)
                .success(function(data) {
                    callback(data);
                })
                .error(function(data) {
                    callback(null);
                    console.log("Error: " + data);
                });
        } else {
            callback(null);
        }
    };

});
