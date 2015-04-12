/*globals app*/
app.controller("CharacterController",
    ["$scope", "$window", "$location", "Character", "Database", function (
        $scope, // The view scope
        $window, // The browser window
        $location, // The window location service
        Character, // The character object
        Database // A reference to the db object
    ) {
        "use strict";
        $scope.errorMessage = "";
        function processNewCharacters(tx, response) {
            if (/SQLError/.test(response)) {
                throw response.message;
            }
            var i;

            $scope.characters = [];
            for (i = 0; i < response.rows.length; i++) {
                $scope.characters.push(new Character(response.rows.item(i).name));
            }
            $scope.$apply(); // Need to use $apply to let ng know something changed in a callback
        }

        function loadCharacters() {
            Database.transaction(function (tx) {
                var sql = "SELECT name FROM " + Character.TABLE_NAME;
                tx.executeSql(sql, [], processNewCharacters, processNewCharacters);
            });
        }

        $scope.createCharacter = function (name) {
            if (name && name.length > 1) {
                $window.setTimeout(loadCharacters, 10);
                $location.path("/");
                return new Character(name);
            }
            $scope.errorMessage = "You must provide a name.";
            angular.element("#charName").focus();
        };

        $scope.readURL = function (input) {
            if (input.files && input.files[0]) {
                var reader = new $window.FileReader();

                reader.onload = function (e) {
                    angular.element("#imageFrame").src = e.target.result;
                    var ctx = document.createElement("canvas").getContext('2d');
                    ctx.canvas.height = 300;
                    ctx.drawImage(angular.element("#imageFrame"), 0, 0);
                    angular.element("input[name=imageData]").value = ctx.canvas.toDataURL();
                };
                reader.readAsDataURL(input.files[0]);
            }
        };

        loadCharacters();
    }]);

app.service('Character', ["$http", "Database", "Spell", "Hazard", "Feat", "Skill", function (
    $http,
    Database,
    Spell,
    Hazard,
    Feat,
    Skill
) {
    "use strict";
    /**
     * Character Class
     * @param name The name of the character
     * @constructor
     */
    function Character(name) {
        var self = this;
        this.name = name || "Unnamed Character";
        this.feats = [];
        this.hazards = [];
        this.spells = [];
        this.skills = [];
        this.bab = 0;
        this.level = 0;

        function recoverChar(tx, response) {
            if (/SQLError/.test(response)) {
                throw response.message;
            }
            var i, tableName, ids;
            for (i = 0; i < response.rows.length; i++) {
                tableName = response.rows.item(i).table.toLowerCase() + "s";
                ids = response.rows.item(i).ids;
                if (ids) {
                    self[tableName] = ids.split(',');
                }
            }
        }

        function afterSql(tx, response) {
            if (/SQLError/.test(response)) {
                if (/constraint failed/.test(response.message)) {
                    var sql = "SELECT id FROM " + Character.TABLE_NAME + " WHERE name = ?";
                    tx.executeSql(sql, [self.name], afterSql);
                } else {
                    throw response.message;
                }
            } else if (response.rows.length > 0) {
                self.id = response.rows.item(0).id;
                var sqlLine = "SELECT GROUP_CONCAT(?Id) as ids, " +
                    "'?' as 'table' from " + Character.TABLE_NAME + "? WHERE " +
                    Character.TABLE_NAME + "Id = ?";
                var tables = [Spell.TABLE_NAME, Feat.TABLE_NAME, Skill.TABLE_NAME, Hazard.TABLE_NAME];
                var sqlLines = [];
                var value;
                for (value in tables) {
                    value = tables[value];
                    sqlLines.push(sqlLine
                        .replace("?", value) // valueId
                        .replace("?", value) // 'value' as 'table'
                        .replace("?", value) // from 'Character.TABLE_NAME + value.TableName'
                        .replace("?", self.id)); // WHERE Character.TABLE_NAME + Id = self.id
                }
                tx.executeSql(sqlLines.join(" UNION "), [], recoverChar, recoverChar);
            } else {
                self.id = response.insertId;
                console.log(self.name + " added to the database. ID: " + self.id);
            }
        }

        function addCharacter(tx) {
            var sql = "INSERT INTO " + Character.TABLE_NAME + "(name) VALUES (?)";
            tx.executeSql(sql, [self.name], afterSql, afterSql);
        }

        Database.transaction(addCharacter);
    }

    Character.TABLE_NAME = "Character";

    /**
     * Add a spell to the Character
     * @param {(Number|String)} id - The spell id
     * @param {Function} [success] - Executed after success
     */
    Character.prototype.addSpell = function (id, success) {
        Database.addJoinedItem({
            idA: this.id,
            idB: id,
            idsArray: this.spells,
            tableNameA: Character.TABLE_NAME,
            tableNameB: Spell.TABLE_NAME
        }, success);
    };

    /**
     * Add a feat to the Character
     * @param {(Number|String)} id - The feat id
     * @param {Function} [success] - Executed after success
     */
    Character.prototype.addFeat = function (id, success) {
        Database.addJoinedItem({
            idA: this.id,
            idB: id,
            idsArray: this.feats,
            tableNameA: Character.TABLE_NAME,
            tableNameB: Feat.TABLE_NAME
        }, success);
    };

    /**
     * Add a hazard to the Character
     * @param {(Number|String)} id - The spell id
     * @param {Function} [success] - Executed after success
     */
    Character.prototype.addHazard = function (id, success) {
        Database.addJoinedItem({
            idA: this.id,
            idB: id,
            idsArray: this.hazards,
            tableNameA: Character.TABLE_NAME,
            tableNameB: Hazard.TABLE_NAME
        }, success);
    };

    /**
     * Remove a spell from the Character
     * @param {(Number|String)} id - The spell id
     * @param {Function} [success] - Executed after success
     */
    Character.prototype.removeSpell = function (id, success) {
        Database.removeJoinedItem({
            idA: this.id,
            idB: id,
            idsArray: this.spells,
            tableNameA: Character.TABLE_NAME,
            tableNameB: Spell.TABLE_NAME
        }, success);
    };

    /**
     * Remove a feat from the Character
     * @param {(Number|String)} id - The spell id
     * @param {Function} [success] - Executed after success
     */
    Character.prototype.removeFeat = function (id, success) {
        Database.removeJoinedItem({
            idA: this.id,
            idB: id,
            idsArray: this.feats,
            tableNameA: Character.TABLE_NAME,
            tableNameB: Feat.TABLE_NAME
        }, success);
    };

    /**
     * Remove a hazard from the Character
     * @param {(Number|String)} id - The spell id
     * @param {Function} [success] - Executed after success
     */
    Character.prototype.removeHazard = function (id, success) {
        Database.removeJoinedItem({
            idA: this.id,
            idB: id,
            idsArray: this.hazards,
            tableNameA: Character.TABLE_NAME,
            tableNameB: Hazard.TABLE_NAME
        }, success);
    };

    /**
     * Create tables
     * @param success Executed when the table is created
     * @param rebuild True when you want drop the previous table
     */
    Character.createTable = function (success, rebuild) {
        var createTableFunction, afterSql;
        var createCharTableSql = 'CREATE TABLE ' + Character.TABLE_NAME +
            '(' +
            '  id INTEGER PRIMARY KEY,' +
            '  name varchar(50) UNIQUE,' +
            '  bab TINYINT,' +
            '  class INTEGER,' +
            '  level TINYINT' +
            ')';

        var joinTables = [Feat.TABLE_NAME, Spell.TABLE_NAME, Hazard.TABLE_NAME, Skill.TABLE_NAME];
        var createJoinTableSql = 'CREATE TABLE ? ( ' +
            '?Id INTEGER, ' +
            '?Id INTEGER' +
            ')';

        createTableFunction = function (tx) {
            tx.executeSql(createCharTableSql, [], afterSql, afterSql);
        };

        afterSql = function (tx, response) {
            if (/SQLError/.test(response)) {
                if (response.message.indexOf("already exists") > 0) {
                    if (rebuild === true) {
                        rebuild = false;
                        Character.dropTable(createTableFunction);
                        console.log("Rebuilding " + Character.TABLE_NAME + " table.");
                    } else {
                        console.log(Character.TABLE_NAME + " table already exists.");
                    }
                } else {
                    console.error(response.message);
                }
            } else if (joinTables.length > 0) {
                var joinTable = joinTables.pop();
                tx.executeSql(createJoinTableSql
                        .replace("?", Character.TABLE_NAME + joinTable)
                        .replace("?", Character.TABLE_NAME)
                        .replace("?", joinTable),
                    [], afterSql, afterSql);
            } else if (success) {
                success();
            }
        };

        Database.transaction(createTableFunction);
    };

    /**
     * Drop table
     * @param next Executed when the table is dropped
     */
    Character.dropTable = function (next) {
        Database.transaction(function (tx) {
            tx.executeSql('DROP TABLE ' + Character.TABLE_NAME, [], next);
        });
    };

    return Character;
}]);