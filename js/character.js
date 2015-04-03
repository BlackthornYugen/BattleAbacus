/*globals $, Database*/
function Character(name) {
    "use strict";
    this.name = name || "Unnamed Character";
    this.feats = [];
    this.spells = [];
    this.bab = 0;
    this.level = 0;
}

Character.TABLE_NAME = "Characters"

Character.prototype.save = function () {
    "use strict";
    console.log("Saving \"" + this.name + "\"");
    // TODO: FILL PERSIST CHAR CODE
    console.log("\"" + this.name + "\" saved");
};

Character.prototype.load = function () {
    "use strict";
    console.log("Loading \"" + this.name + "\"");
    // TODO: FILL PERSIST CHAR CODE
    console.log("\"" + this.name + "\" loaded");
};

Character.createTable = function (success, rebuild) {
    "use strict";
    var createTableFunction, afterSql;
    var sql = 'CREATE TABLE ' + Character.TABLE_NAME +
        '(' +
        '  id INTEGER PRIMARY KEY,' +
        '  bab TINYINT,' +
        '  class INTEGER,' +
        '  level TINYINT' +
        ')';

    createTableFunction = function (tx) {
        tx.executeSql(sql, [], afterSql, afterSql);
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
        } else if (success) {
            success();
        }
    };

    Database.transaction(createTableFunction);
};

Character.dropTable = function (next) {
    "use strict";
    Database.transaction(function (tx) {
        tx.executeSql('DROP TABLE ' + Character.TABLE_NAME, [], next);
    });
};
