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

Character.TABLE_NAME = "Characters"

/**
 * Add a spell to the Character
 * @param {(Number|String)} id - The spell id
 * @param {Function} [success] - Executed after success
 */
Character.prototype.addSpell = function (id, success) {
    "use strict";
    if (!this.id) {
        console.error(this.name + " does not have a valid ID");
    }
    var afterSql;
    var characterId = this.id;
    var itemTableName = Spell.TABLE_NAME;
    var joinTableName = Character.TABLE_NAME + itemTableName;
    var sql = "INSERT INTO " + joinTableName + "(" +
        Character.TABLE_NAME + "Id, " + itemTableName + "Id) VALUES (?, ?)";

    // If spell not already added, add it to object & persist to websql
    if (this.spells.indexOf(id) === -1) {
        this.spells.push(id); // TODO: Only add to object on successful SQL insert
        Database.transaction(function (tx) {
            tx.executeSql(sql, [characterId, id], afterSql, afterSql);
        });
    }

    afterSql = function (tx, response) {
        if (/SQLError/.test(response)) {
            throw response.message;
        }

        if (success) {
            success();
        }
    };
};

/**
 * Remove a spell from the Character
 * @param {(Number|String)} id - The spell id
 * @param {Function} [success] - Executed after success
 */
Character.prototype.removeSpell = function (id, success) {
    "use strict";
    var afterSql;
    var characterId = this.id;
    var itemTableName = Spell.TABLE_NAME;
    var joinTableName = Character.TABLE_NAME + itemTableName;
    var spellArrayIndex = this.spells.indexOf(id);
    var sql = "DELETE FROM " + joinTableName + " WHERE " +
        Character.TABLE_NAME + "Id = ? AND " + itemTableName + "Id = ?";

    // If spell added, remove it from object & websql
    if (spellArrayIndex !== -1) {
        this.spells.splice(spellArrayIndex, 1); // TODO: Only remove successful SQL delete
        Database.transaction(function (tx) {
            tx.executeSql(sql, [characterId, id], afterSql, afterSql);
        });
    }

    afterSql = function (tx, response) {
        if (/SQLError/.test(response)) {
            throw response.message;
        }

        if (success) {
            success();
        }
    };
};

/**
 * Create table
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

    var joinTables = [Feat.TABLE_NAME, Spell.TABLE_NAME, Hazard.TABLE_NAME, "Skills"];
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
