var app = angular.module('battleAbacus', ['ngRoute', 'ngMaterial', 'ngSanitize']);

app.run(["$rootScope", "$location", "$mdSidenav", "CharacterManager", "Spell", "Hazard", "Feat", "Character", function (
    $rootScope,
    $location,
    $mdSidenav,
    CharacterManager,
    Spell,
    Hazard,
    Feat,
    Character
) {
    "use strict";
    /* Page Variables & Function */
    $rootScope.page = 1;
    $rootScope.skip = 0;
    $rootScope.pageSize = 9; // Default page size
    $rootScope.setPage = function (num) {
        num = Math.max(num, 1); // Minimum 1
        num = Math.ceil(num); // Round up
        $rootScope.page = num;
        $rootScope.skip = (num - 1) * $rootScope.pageSize;
    };

    /**
     * Toggle the navigation bar
     * @returns {*}
     */
    $rootScope.toggleLeft = function () {
        return $mdSidenav('left').toggle();
    };

    /**
     * Navigate to the specified path
     * @param path
     */
    $rootScope.go = function ( path ) {
        $location.path( path );
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
            templateUrl: 'view/spell/spells_nav.html',
            controller: 'SpellsController'
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
            templateUrl: 'view/spell/spells_nav.html',
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

/* FILTERS */

/**
 * This filter is+ from Angular 4
 */
app.filter("limitTo", function () {
    return function(input, limit, begin) {
        function toInt(str) { return parseInt(str, 10);}
        function isNumber(value) {return typeof value === 'number';}
        function isString(value) {return typeof value === 'string';}
        var isArray = Array.isArray;

        if (Math.abs(Number(limit)) === Infinity) {
            limit = Number(limit);
        } else {
            limit = toInt(limit);
        }
        if (isNaN(limit)) return input;

        if (isNumber(input)) input = input.toString();
        if (!isArray(input) && !isString(input)) return input;

        begin = (!begin || isNaN(begin)) ? 0 : toInt(begin);
        begin = (begin < 0 && begin >= -input.length) ? input.length + begin : begin;

        if (limit >= 0) {
            return input.slice(begin, begin + limit);
        } else {
            if (begin === 0) {
                return input.slice(limit, input.length);
            } else {
                return input.slice(Math.max(0, begin + limit), begin);
            }
        }
    }
});

app.filter('floor', function() {
    return function(input) {
        return Math.floor(input);
    };
});

app.filter('ceil', function() {
    return function(input) {
        return Math.ceil(input);
    };
});

app.filter('max', function() {
    return function(input, max) {
        return Math.min(input, max);
    };
});

app.filter('min', function() {
    return function(input, min) {
        return Math.max(input, min);
    };
});

/**
 * http://stackoverflow.com/a/18186947/2535649
 * http://stackoverflow.com/a/6712058/2535649
 */
app.filter('orderObjectBy', function(){
    return function(input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for(var objectKey in input) {
            array.push(input[objectKey]);
        }

        array.sort(function(a, b){
            var nameA=a[attribute].toLowerCase(),
                nameB=b[attribute].toLowerCase();
            if (nameA < nameB) //sort string ascending
                return -1;
            if (nameA > nameB)
                return 1;
            return 0; //default return value (no sorting)
        });
        return array;
    }
});

/**
 * Battle Abacus click event fixed clickthrough issue with touch events
 */
app.directive('baClick', function() {

    return function(scope, element, attrs) {

        element.bind('touchstart click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            // Only run if disabled is false
            if(!element.attr("disabled")) {
                scope.$apply(attrs['baClick']);
            }
        });
    };
});