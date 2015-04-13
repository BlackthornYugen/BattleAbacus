/*global app*/
app.controller("FeatsController", ["$scope",  "Feat", "CharacterManager", function ($scope, Feat, CharacterManager) {
    "use strict";
    $scope.character = CharacterManager.getActiveCharacter();
    Feat.GetRecords(function (feats) {
        $scope.feats = feats;
        $scope.$apply();
    });
}]);

app.service('Feat', ["$http", "Database", function ($http, Database) {
    "use strict";
    /**
     * Feat class
     * @param {String} [name=Unnamed Feat] - Name of the Feat
     * @constructor
     */
    function Feat(name) {
        this.id = 0;
        this.name = name || "Unnamed Feat";
    }

    Feat.DATA_URL = "http://home.steelcomputers.com:31338/feats.json";
    Feat.TABLE_NAME = "Feat";

    /**
     * Load json data and insert it into websql
     */
    Feat.loadData = function () {
        var featData, addItem, onSqlError;

        addItem = function (tx) {
            var feat = {};
            var sql = 'INSERT INTO ' + Feat.TABLE_NAME + ' VALUES (?, ?, ?, ?, ?, ?)';
            var key;

            for (key in featData) {
                feat[key] = featData[key].shift();
            }

            if (featData[key].length > 0) {
                tx.executeSql(sql, [null, feat.name, feat.type, feat.source, feat.description,
                    feat.benefit], addItem, onSqlError);
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

        $http.get(Feat.DATA_URL).then(function (response) {
            featData = response.data;
            Database.transaction(function (tx) {
                addItem(tx);
            });
        });
    };

    /**
     * Create table
     * @param {Function} success - Executed when the table is created
     * @param {Boolean} rebuild - Drop the previous table
     */
    Feat.createTable = function (success, rebuild) {
        var createTableFailure, createTableSuccess;

        createTableFailure = function (tx, error) {
            if (error.message.indexOf("already exists") > 0) {
                if (rebuild === true) {
                    rebuild = false;
                    Feat.dropTable(createTableSuccess);
                    console.log("Rebuilding " + Feat.TABLE_NAME + " table.");
                } else {
                    console.log(Feat.TABLE_NAME + " table already exists.");
                }
            } else {
                console.error(error.message);
            }
        };

        createTableSuccess = function (tx) {
            tx.executeSql('CREATE TABLE ' + Feat.TABLE_NAME +
                '(' +
                '  id INTEGER PRIMARY KEY,' +
                '  name varchar(50),' +
                '  type varchar(50),' +
                '  source varchar(50),' +
                '  description varchar(50),' +
                '  benefit varchar(50)' +
                ')', [], success, createTableFailure);
        };

        Database.transaction(createTableSuccess);
    };

    /**
     * Drop table
     * @param {Function} next - Executed when the table is dropped
     */
    Feat.dropTable = function (next) {
        Database.transaction(function (tx) {
            tx.executeSql('DROP TABLE ' + Feat.TABLE_NAME, [], next);
        });
    };

    /**
     * Count the number of records in the table
     * @param {Function} next - Calls this with the number of records or with -1 on error.
     */
    Feat.countRecords = function (next) {
        var executeSql, afterSQL;
        var sql = 'SELECT COUNT(*) as count FROM ' + Feat.TABLE_NAME;

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
    Feat.GetRecords = function (next, options) {
        var sql = "SELECT * FROM " + Feat.TABLE_NAME;
        var DEFAULT_LIMIT = 100;
        var DEFAULT_SKIP = 0;
        if (typeof options !== "object") {
            options = {};
        }
        var i, afterSql;
        if (options.filter) {
            sql += " WHERE type LIKE \"%" + options.filter + "%\"";
        }
        sql += " LIMIT "
            + (options.skip || DEFAULT_SKIP) + ", "
            + (options.limit || DEFAULT_LIMIT) + ";";
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
     * @param {(Number|String)} id The record ID to locate
     */
    Feat.GetRecord = function (next, id) {
        var sql = "SELECT * FROM " + Feat.TABLE_NAME + " WHERE id = ?";

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

    return Feat;
}]);