/*global app */
app.controller('NavController', function ($scope, $mdSidenav) {
    $scope.toggleLeft = buildToggler('left');
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
        return function () {
            return $mdSidenav(navID).toggle();
        };
    }
});
