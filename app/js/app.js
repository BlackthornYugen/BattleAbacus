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
        when('/newcharacter', {
            templateUrl: 'view/character/new.html',
            controller: 'CharacterController'
        }).
        when('/hazards', {
            templateUrl: 'view/hazard/hazards.html',
            controller: 'HazardsController'
        }).
        when('/hazards/all', {
            templateUrl: 'view/hazard/hazards_all.html',
            controller: 'HazardsController'
        }).
        when('/hazard/:hazardId', {
            templateUrl: 'view/hazard/hazard.html',
            controller: 'HazardController'
        }).
        otherwise({
            redirectTo: '/'
        });
}]);