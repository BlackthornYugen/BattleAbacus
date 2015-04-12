var app = angular.module('battleAbacus', ['ngRoute']);

app.run(["Spell", "Hazard", "Feat", "Character", function (Spell, Hazard, Feat, Character) {
    "use strict";
    Spell.createTable(function () { Spell.loadData(); });
    Hazard.createTable(function () { Hazard.loadData(); });
    Feat.createTable(function () { Feat.loadData(); });
    Character.createTable();
}]);

app.config(['$routeProvider', function ($routeProvider) {
    "use strict";
    $routeProvider.
        when('/', {
            templateUrl: 'view/menu/menu.html'
        }).
        when('/hazard', {
            templateUrl: 'view/hazard/hazards.html',
            controller: 'HazardController'
        }).
        when('/hazard/:hazardId', {
            templateUrl: 'view/hazard/hazards.html',
            controller: 'HazardController'
        }).
        otherwise({
            redirectTo: '/'
        });
}]);