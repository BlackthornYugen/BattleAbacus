/*globals $, Database, Feat, Spell, Hazard*/
/**
 * Character Class
 * @param name The name of the character
 * @constructor
 */
function Character(name) {
    "use strict";
    this.name = name || "Unnamed Character";
    this.feats = [];
    this.hazard = [];
    this.spells = [];
    this.skills = [];
    this.bab = 0;
    this.level = 0;
}

Character.TABLE_NAME = "Character";

/**
 * Add a spell to the Character
 * @param {(Number|String)} id - The spell id
 * @param {Function} [success] - Executed after success
 */
Character.prototype.addSpell = function (id, success) {
    "use strict";
    Database.addJoinedItem({idA: this.id, idB: id, idsArray: this.spells,
        tableNameA: Character.TABLE_NAME, tableNameB: Spell.TABLE_NAME}, success);
};

/**
 * Add a feat to the Character
 * @param {(Number|String)} id - The feat id
 * @param {Function} [success] - Executed after success
 */
Character.prototype.addFeat = function (id, success) {
    "use strict";
    Database.addJoinedItem({idA: this.id, idB: id, idsArray: this.feats,
        tableNameA: Character.TABLE_NAME, tableNameB: Feat.TABLE_NAME}, success);
};

/**
 * Add a hazard to the Character
 * @param {(Number|String)} id - The spell id
 * @param {Function} [success] - Executed after success
 */
Character.prototype.addHazard = function (id, success) {
    "use strict";
    Database.addJoinedItem({idA: this.id, idB: id, idsArray: this.hazard,
        tableNameA: Character.TABLE_NAME, tableNameB: Hazard.TABLE_NAME}, success);
};

/**
 * Remove a spell from the Character
 * @param {(Number|String)} id - The spell id
 * @param {Function} [success] - Executed after success
 */
Character.prototype.removeSpell = function (id, success) {
    "use strict";
    Database.removeJoinedItem({idA: this.id, idB: id, idsArray: this.spells,
        tableNameA: Character.TABLE_NAME, tableNameB: Spell.TABLE_NAME}, success);
};

/**
 * Remove a feat from the Character
 * @param {(Number|String)} id - The spell id
 * @param {Function} [success] - Executed after success
 */
Character.prototype.removeFeat = function (id, success) {
    "use strict";
    Database.removeJoinedItem({idA: this.id, idB: id, idsArray: this.feats,
        tableNameA: Character.TABLE_NAME, tableNameB: Feat.TABLE_NAME}, success);
};

/**
 * Remove a hazard from the Character
 * @param {(Number|String)} id - The spell id
 * @param {Function} [success] - Executed after success
 */
Character.prototype.removeHazard = function (id, success) {
    "use strict";
    Database.removeJoinedItem({idA: this.id, idB: id, idsArray: this.hazard,
        tableNameA: Character.TABLE_NAME, tableNameB: Hazard.TABLE_NAME}, success);
};

/**
 * Create tables
 * @param success Executed when the table is created
 * @param rebuild True when you want drop the previous table
 */
Character.createTable = function (success, rebuild) {
    "use strict";
    var createTableFunction, afterSql;
    var createCharTableSql = 'CREATE TABLE ' + Character.TABLE_NAME +
        '(' +
        '  id INTEGER PRIMARY KEY,' +
        '  name varchar(50),' +
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
    "use strict";
    Database.transaction(function (tx) {
        tx.executeSql('DROP TABLE ' + Character.TABLE_NAME, [], next);
    });
};