var isNewer = angular.module('relate', []);

isNewer.controller('mainController', function ($scope, $http) {
    var DEFAULT_BANNER = "Enter two commits to compare them"
    $scope.formData = {};
    $scope.result = null;
    $scope.commit1 = null;
    $scope.commit2 = null;
    $scope.bannerMessage = DEFAULT_BANNER;

    $scope.checkIsNewer = function(callback) {
        $http.post('/api/relate', $scope.formData)
            .success(function(data) {
                var commit1 = $scope.formData.commit1;
                    commit2 = $scope.formData.commit2;
                callback(commit1, commit2, data.relationship);
            })
            .error(function(data) {
                console.log("Error: " + data);
            });
    };


    $scope.updateRelationship = function() {
        if ($scope.commit1 && $scope.commit2) {
            $scope.checkIsNewer(function(commit1, commit2, result) {
                switch(result) {
                case 'none':
                    $scope.bannerMessage = commit1 + " and " + commit2 + " are not in the same branch.";
                    break;
                case 'ancestor':
                    $scope.bannerMessage = commit1 + " is older than " + commit2;
                    break;
                case 'descendant':
                    $scope.bannerMessage = commit1 + " is newer than " + commit2;
                    break;
                }
            });
        } else {
            $scope.bannerMessage = DEFAULT_BANNER;
            $scope.result = null;
        }
    };


    $scope.updateCommit = function(commit_name) {
        var commit = $scope.formData[commit_name];
        $scope.tryLookupRev(commit, function(commit_data) {
            $scope[commit_name] = commit_data;
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
