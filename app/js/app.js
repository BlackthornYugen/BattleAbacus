var app = angular.module('battleAbacus', ['ngRoute', 'ngMaterial', 'ngSanitize']);

app.run(["$rootScope", "$mdSidenav", "CharacterManager", "Spell", "Hazard", "Feat", "Character", function (
    $rootScope,
    $mdSidenav,
    CharacterManager,
    Spell,
    Hazard,
    Feat,
    Character
) {
    "use strict";
    $rootScope.toggleLeft = function () {
        return $mdSidenav('left').toggle();
    };

    CharacterManager.loadCharacters(); // Set default character
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
            templateUrl: 'view/character/character_nav.html',
            controller: 'CharacterController'
        }).
        /* CHARACTER ROUTES */
        when('/newcharacter', {
            templateUrl: 'view/character/new.html',
            controller: 'CharacterController'
        }).
        /* FEAT ROUTES */
        when('/feats', {
            templateUrl: 'view/feat/feats_nav.html',
            controller: 'FeatsController'
        }).
        when('/feats/:featId', {
            templateUrl: 'view/feat/feat.html',
            controller: 'FeatController'
        }).
        /* HAZARD ROUTES */
        when('/hazards', {
            templateUrl: 'view/hazard/hazards_nav.html',
            controller: 'HazardsController'
        }).
        when('/hazard/:hazardId', {
            templateUrl: 'view/hazard/hazard.html',
            controller: 'HazardController'
        }).
        /* SKILL ROUTES */
        when('/skill/skills', {
            templateUrl: 'view/skill/skills.html',
            controller: 'SkillsController'
        }).
        when('/skill/:skillId', {
            templateUrl: 'view/skill/skill.html',
            controller: 'SkillController'
        }).
        /* SPELL ROUTES */
        when('/spells', {
            templateUrl: 'view/spell/spells.html',
            controller: 'SpellsController'
        }).
        when('/spells/all', {
            templateUrl: 'view/spell/spells_all.html',
            controller: 'SpellsController'
        }).
        when('/spell/:spellId', {
            templateUrl: 'view/spell/spell.html',
            controller: 'SpellController'
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