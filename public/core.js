var isNewer = angular.module('isnewer', []);

function mainController($scope, $http) {
    $scope.formData = {};
    $scope.hasResult = false;
    $scope.result = "";
    $scope.checkIsNewer = function() {
        $http.post('/api/isnewer', $scope.formData)
            .success(function(data) {
                ancestor = $scope.formData.ancestor;
                descendant = $scope.formData.descendant;
                if (data.result) { 
                    $scope.result = descendant + " is newer than " + ancestor;
                } else {
                    $scope.result = descendat + " is not newer than " + ancestor;
                }
                $scope.formData = {};
                $scope.hasResult = true;
                console.log(data);
            })
            .error(function(data) {
                console.log("Error: " + data);
            });
    };

}
