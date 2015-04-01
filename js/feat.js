/*globals $, Database*/

function Feat(id, name) {
    "use strict";
    this.id = id || 0;
    this.name = name || "Unnamed Feat";
}

Feat.DATA_URL = "http://node.steelcomputers.com:31338/feats.json";
Feat.TABLE_NAME = "Feats";

Feat.loadData = function () {
    "use strict";
    var featData, addItem, onSqlError;

    addItem = function (tx) {
        var feat = {};
        var x;

        for (x in featData) {
            feat[x] = featData[x].shift();
        }

        if (featData[x].length > 0) {
            tx.executeSql('INSERT INTO ' + Feat.TABLE_NAME +  ' VALUES (?, ?)',
                [feat.id, feat.name], addItem, onSqlError);
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
        url: Feat.DATA_URL,
        data: null,
        success: function (data) {
            featData = data;
            Database.transaction(function (tx) {
                addItem(tx);
            });
        }
    });
};

Feat.createTable = function (success) {
    "use strict";
    var createSpellsFailure, createSpellsTable;

    createSpellsFailure = function (tx, error) {
        if (error.message.indexOf("already exists") > 0) {
            Feat.dropTable(createSpellsTable);
            console.log("Rebuilding " + Feat.TABLE_NAME + " table.");
        } else {
            console.error(error.message);
        }
    };

    createSpellsTable = function (tx) {
        tx.executeSql('CREATE TABLE ' + Feat.TABLE_NAME +
            '(' +
            '  type_id INTEGER PRIMARY KEY,' +
            '  type_name varchar(50)' +
            ')', [], success, createSpellsFailure);
    };

    Database.transaction(createSpellsTable);
};

Feat.dropTable = function (next) {
    "use strict";
    Database.transaction(function (tx) {
        tx.executeSql('DROP TABLE ' + Feat.TABLE_NAME, [], next);
    });
};