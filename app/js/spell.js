/*globals app*/
app.controller("SpellsController", ["$scope", "Spell", "CharacterManager", function (
    $scope, // The view scope
    Spell, // The hazard object
    CharacterManager
) {
    "use strict";
    //sets current character
    $scope.character = CharacterManager.getActiveCharacter();
    //gets all spells from the websql db
    Spell.GetRecords(function (spells) {
        $scope.spells = spells;
        $scope.$apply();
    });
}]);

app.controller("SpellController", ["$scope", "$location", "$routeParams", "Spell", "CharacterManager", function (
    $scope, // The view scope
    $location, // Let this controller change the path
    $routeParams, // An object to get route paramaters
    Spell, // The Spell object
    CharacterManager
) {
    "use strict";
    $scope.spell = {name: "Can't find spell...", id: "?"};
    $scope.title = "All Spells";
    $scope.character = CharacterManager.getActiveCharacter();
    $scope.existsOnChar = true;
    $scope.toggleSpell = function (id) {
        if ($scope.existsOnChar) {
            $scope.character.removeSpell(id);
        } else {
            $scope.character.addSpell(id);
        }
        $location.path("/spells");
    };

    function afterSql(response) {
        if ($scope.character.spells.indexOf(response.id) < 0) {
            $scope.existsOnChar = false;
        }
        $scope.spell = response;
        $scope.$apply();
    }

    if ($routeParams.spellId) {
        Spell.GetRecord(afterSql, $routeParams.spellId);
    }
}]);


app.service('Spell', ["$http", "Database", function ($http, Database) {
    "use strict";
    /**
     * Spell class
     * @param {String} [name=Unnamed Spell] - The name of the spell
     * @constructor
     */
    function Spell(name) {
        this.id = 0;
        this.name = name || "Unnamed Spell";
    }

    Spell.REQUIREMENTS = ["sor", "wiz", "cleric", "druid", "ranger", "bard", "paladin", "alchemist",
        "summoner", "witch", "inquisitor", "oracle"];
    Spell.DATA_URL = "http://home.steelcomputers.com:31338/spells.json";
    Spell.TABLE_NAME = "Spell";

    /**
     * Load json data and insert it into websql
     */
    Spell.loadData = function () {
        var spellData, addItem, onSqlError;

        addItem = function (tx) {
            var i;
            var spell = spellData.shift();
            if (spell) {
                var data = [null, spell.name, spell.description_formated];
                var sql = 'INSERT INTO ' + Spell.TABLE_NAME + ' VALUES (?, ?, ?)';
                for (i in Spell.REQUIREMENTS) {
                    data.push(spell[Spell.REQUIREMENTS[i]]);
                    sql = sql.replace('?, ', '?, ?, ');
                }
                tx.executeSql(sql,
                    data, addItem, onSqlError);
            }
        };

        onSqlError = function (tx, error) {
            if (error.message && error.message.match(/constraint failed/)) {
                console.error("Constraint failure. Is the name unique?");
            } else {
                console.error(error.message);
            }
            addItem(tx);
        };

        $http.get(Spell.DATA_URL).then(function (response) {
            spellData = response.data;
            Database.transaction(function (tx) {
                addItem(tx);
            });
        });
    };

    /**
     * Create table
     * @param {Function} success - Executed when the table is created
     * @param {Boolean} [rebuild] - Drop the previous table
     */
    Spell.createTable = function (success, rebuild) {
        var createTableFailure, createTableSuccess;

        createTableFailure = function (tx, error) {
            if (error.message.indexOf("already exists") > 0) {
                if (rebuild === true) {
                    rebuild = false;
                    Spell.dropTable(createTableSuccess);
                    console.log("Rebuilding " + Spell.TABLE_NAME + " table.");
                } else {
                    console.log(Spell.TABLE_NAME + " table already exists.");
                }
            } else {
                console.error(error.message);
            }
        };

        createTableSuccess = function (tx) {
            var i;
            var sql = 'CREATE TABLE ' + Spell.TABLE_NAME +
                '(' +
                '  id INTEGER PRIMARY KEY, ' +
                '  name varchar(50), ' +
                '  description ntext ';
            for (i in Spell.REQUIREMENTS) {
                sql += ", " + Spell.REQUIREMENTS[i] + "_lvl TINYINT";
            }
            sql += ')';
            tx.executeSql(sql, [], success, createTableFailure);
        };

        Database.transaction(createTableSuccess);
    };

    /**
     * Drop table
     * @param {Function} next - Executed when the table is dropped
     */
    Spell.dropTable = function (next) {
        Database.transaction(function (tx) {
            tx.executeSql('DROP TABLE ' + Spell.TABLE_NAME, [], next);
        });
    };

    /**
     * Count the number of records in the table
     * @param {Function} next - Calls this with the number of records or with -1 on error.
     */
    Spell.countRecords = function (next) {
        var executeSql, afterSQL;
        var sql = 'SELECT COUNT(*) as count FROM ' + Spell.TABLE_NAME;

        executeSql = function (tx) {
            tx.executeSql(sql, [], afterSQL, afterSQL);
        };

        afterSQL = function (tx, response) {
            var count = -1;
            if (/SQLError/.test(response)) {
                console.error(response); // Got an SQL error, dump it to console.
            } else if (response.rows.length > 0) {
                count = response.rows.item(0).count;
            } else {
                console.info("The following statement yielded no results: \n" + sql);
            }
            next(count);
        };

        Database.transaction(executeSql);
    };

    /**
     * Get all records
     * @param {Function} next - The function to call with the matching records
     * @param {{filter: string, skip: number, limit: number}} options
     */
    Spell.GetRecords = function (next, options) {
        var sql = "SELECT * FROM " + Spell.TABLE_NAME;
        var DEFAULT_LIMIT = 100;
        var DEFAULT_SKIP = 0;
        if (typeof options !== "object") {
            options = {};
        }
        var i, afterSql;
        if (options.filter) {
            sql += " WHERE name LIKE \"%" + options.filter + "%\"";
        }
        sql += " LIMIT "
            + (options.skip || DEFAULT_SKIP) + ", "
            + (options.limit || DEFAULT_LIMIT) +  ";";
        Database.transaction(function (tx) {
            tx.executeSql(sql, null, afterSql, afterSql);
        });

        afterSql = function (tx, response) {
            if (/SQLError/.test(response)) {
                console.error(response);
            } else if (response.rows.length > 0) {
                var results = [];
                for (i = 0; i < response.rows.length; i++) {
                    results.push(response.rows.item(i));
                }
                next(results);
            } else {
                console.info("The following statement yielded no results: \n" + sql);
            }
        };
    };

    /**
     * Get the record that matches a specific ID
     * @param {Function} next - The function to call with the record
     * @param {(Number|String)} id - The record ID to locate
     */
    Spell.GetRecord = function (next, id) {
        var sql = "SELECT * FROM " + Spell.TABLE_NAME + " WHERE id = ?";

        function afterSql(tx, response) {
            if (/SQLError/.test(response)) {
                console.error(response);
            } else if (response.rows.length > 0) {
                next(response.rows.item(0));
            } else {
                console.error("No record matched ID: " + id);
            }
        }

        Database.transaction(function (tx) {
            tx.executeSql(sql, [id], afterSql, afterSql);
        });
    };

    return Spell;
}]);
