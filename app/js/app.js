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
        /* CHARACTER ROUTES */
        when('/newcharacter', {
            templateUrl: 'view/character/new.html',
            controller: 'CharacterController'
        }).
        /* FEAT ROUTES */
        when('/feats', {
            templateUrl: '',
            controller: ''
        }).
        /* HAZARD ROUTES */
        when('/hazards', {
            templateUrl: 'view/hazard/hazards.html',
            controller: 'HazardsController'
        }).
        when('/hazards/all', {
            templateUrl: 'view/hazard/hazards_all.html',
            controller: 'HazardsController'
        }).
        when('/hazard/:hazardId', {
            templateUrl: '../view/hazard/details.html',
            controller: 'HazardController'
        }).
        when('/addHazard/:hazardId', {
            templateUrl: '../view/hazard/add.html',
            controller: 'HazardController'
        }).
        /* SKILL ROUTES */
        when('/skills', {
            templateUrl: '',
            controller: ''
        }).
        /* SPELL ROUTES */
        when('/spells', {
            templateUrl: '',
            controller: ''
        }).
        /* DEFAULT ROUTE */
        otherwise({
            redirectTo: '/'
        });
}]);