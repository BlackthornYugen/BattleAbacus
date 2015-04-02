/*globals $, Database*/
function Spell(id, name) {
    "use strict";
    this.id = id || 0;
    this.name = name || "Unnamed Spell";
}

Spell.REQUIREMENTS = ["sor", "wiz", "cleric", "druid", "ranger", "bard", "paladin", "alchemist",
    "summoner", "witch", "inquisitor", "oracle"]
Spell.DATA_URL = "http://home.steelcomputers.com:31338/spells.json";
Spell.TABLE_NAME = "Spells";

Spell.loadData = function () {
    "use strict";
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

    $.ajax({
        dataType: "json",
        url: Spell.DATA_URL,
        data: null,
        success: function (data) {
            spellData = data;
            Database.transaction(function (tx) {
                addItem(tx);
            });
        }
    });
};

Spell.createTable = function (success, rebuild) {
    "use strict";
    var createSpellsFailure, createSpellsTable;

    createSpellsFailure = function (tx, error) {
        if (error.message.indexOf("already exists") > 0) {
            Spell.dropTable(createSpellsTable);
            if (rebuild === true) {
                console.log("Rebuilding " + Spell.TABLE_NAME + " table.");
            } else {
                console.log(Spell.TABLE_NAME + " table already exists.");
            }
        } else {
            console.error(error.message);
        }
    };

    createSpellsTable = function (tx) {
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
        tx.executeSql(sql, [], success, createSpellsFailure);
    };

    Database.transaction(createSpellsTable);
};

Spell.dropTable = function (next) {
    "use strict";
    Database.transaction(function (tx) {
        tx.executeSql('DROP TABLE ' + Spell.TABLE_NAME, [], next);
    });
};

/**
 * Count the number of records in the table
 * @param next Calls this with the number of records or with -1 on error.
 */
Spell.countRecords = function (next) {
    "use strict";
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
            console.error("The following statement yielded no results: \n" + sql);
        }
        next(count);
    };

    Database.transaction(executeSql);
};