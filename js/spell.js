/*globals $, Database*/
var EXPECTED_RECORDS = 1000;
var DATA_URL = "http://node.steelcomputers.com:31338/spells.json";

function Spell(id, name) {
    "use strict";
    this.id = id || 0;
    this.name = name || "Unnamed Spell";
}


Spell.loadData = function () {
    "use strict";
    var spellData, addSpell, onSqlError;

    addSpell = function (tx) {
        var spell = spellData.shift();
        if (spell) {
            tx.executeSql('INSERT INTO Spells VALUES (?, ?)', [spell.id, spell.name], addSpell, onSqlError);
        }
    };

    onSqlError = function (tx, error) {
        if (error.message && error.message.match(/constraint failed/)) {
            console.error("ID already exists or is invalid");
        } else {
            console.error(error.message);
        }
        addSpell(tx);
    };

    $.ajax({
        dataType: "json",
        url: DATA_URL,
        data: null,
        success: function (data) {
            spellData = data;
            Database.transaction(function (tx) {
                addSpell(tx);
            });
        }
    });
};

Spell.createTable = function (success) {
    "use strict";
    var createSpellsFailure, createSpellsTable;

    createSpellsFailure = function (tx, error) {
        if (error.message.indexOf("already exists") > 0) {
            tx.executeSql("drop table Spells", [], createSpellsTable);
            console.log("Rebuilding Spells table.");
        } else {
            console.error(error.message);
        }
    };

    createSpellsTable = function (tx) {
        tx.executeSql('CREATE TABLE Spells ' +
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
        tx.executeSql('DROP TABLE spells', [], next);
    });
};

$(function () {
    "use strict";
    // INIT THINGS
})