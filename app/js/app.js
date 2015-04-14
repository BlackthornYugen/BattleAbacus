var app = angular.module('battleAbacus', ['ngRoute', 'ngMaterial']);

app.run(["Spell", "Hazard", "Feat", "Character", function (Spell, Hazard, Feat, Character) {
    "use strict";
    Character.activeCharacter = 1; // Set default character
    Spell.createTable(function () { Spell.loadData(); });
    Hazard.createTable(function () { Hazard.loadData(); });
    Feat.createTable(function () { Feat.loadData(); });
    Character.createTable();
}]);

app.config(['$routeProvider', '$mdThemingProvider', function ($routeProvider, $mdThemingProvider) {
    "use strict";
    // Configure routes
    $routeProvider.
        when('/', {
            templateUrl: 'view/menu/menu.html',
            controller: 'CharacterController'
        }).
        /* CHARACTER ROUTES */
        when('/newcharacter', {
            templateUrl: 'view/character/new.html',
            controller: 'CharacterController'
        }).
        /* FEAT ROUTES */
        when('/feats', {
            templateUrl: 'view/feat/feats.html',
            controller: 'FeatsController'
        }).
        when('/feats/all', {
            templateUrl: 'view/feat/feats_all.html',
            controller: 'FeatsController'
        }).
        when('/feats/:featId', {
            templateUrl: 'view/feat/feat.html',
            controller: 'FeatController'
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
            templateUrl: 'view/hazard/hazard.html',
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

    // Configure a dark theme with primary foreground yellow
    $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('yellow')
        .dark();
}]);