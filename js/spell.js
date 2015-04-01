/*globals $, Database*/
function Spell(id, name) {
    "use strict";
    this.id = id || 0;
    this.name = name || "Unnamed Spell";
}

Spell.DATA_URL = "http://node.steelcomputers.com:31338/spells.json";
Spell.TABLE_NAME = "Spells";

Spell.loadData = function () {
    "use strict";
    var spellData, addItem, onSqlError;

    addItem = function (tx) {
        var spell = spellData.shift();
        if (spell) {
            tx.executeSql('INSERT INTO ' + Spell.TABLE_NAME + ' VALUES (?, ?)',
                [spell.id, spell.name], addItem, onSqlError);
        }
    };

    onSqlError = function (tx, error) {
        if (error.message && error.message.match(/constraint failed/)) {
            console.error("ID already exists or is invalid");
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

Spell.createTable = function (success) {
    "use strict";
    var createSpellsFailure, createSpellsTable;

    createSpellsFailure = function (tx, error) {
        if (error.message.indexOf("already exists") > 0) {
            Spell.dropTable(createSpellsTable);
            console.log("Rebuilding " + Spell.TABLE_NAME + " table.");
        } else {
            console.error(error.message);
        }
    };

    createSpellsTable = function (tx) {
        tx.executeSql('CREATE TABLE ' + Spell.TABLE_NAME +
            '(' +
            '  type_id INTEGER PRIMARY KEY,' +
            '  type_name varchar(50)' +
            ')', [], success, createSpellsFailure);
    };

    Database.transaction(createSpellsTable);
};

Spell.dropTable = function (next) {
    "use strict";
    Database.transaction(function (tx) {
        tx.executeSql('DROP TABLE ' + Spell.TABLE_NAME, [], next);
    });
};