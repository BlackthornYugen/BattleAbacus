/*globals $, Database*/

function Hazard(id, name) {
    "use strict";
    this.id = id || 0;
    this.name = name || "Unnamed Hazard";
}

Hazard.DATA_URL = "http://home.steelcomputers.com:31338/hazzards.json";
Hazard.TABLE_NAME = "Hazzards";

Hazard.loadData = function () {
    "use strict";
    var hazzardData, addItem, onSqlError;

    addItem = function (tx) {
        var hazzard = {};
        var sql = 'INSERT INTO ' + Hazard.TABLE_NAME +  ' VALUES (?, ?, ?, ?, ?, ?, ?)';
        var key;

        for (key in hazzardData) {
            hazzard[key] = hazzardData[key].shift();
        }

        if (hazzardData[key].length > 0) {
            tx.executeSql(sql, [null, hazzard.name, hazzard.type, hazzard.save, hazzard.onset,
                hazzard.frequency, hazzard.effect], addItem, onSqlError);
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
        url: Hazard.DATA_URL,
        data: null,
        success: function (data) {
            hazzardData = data;
            Database.transaction(function (tx) {
                addItem(tx);
            });
        }
    });
};

Hazard.createTable = function (success, rebuild) {
    "use strict";
    var createTableFailure, createTableSuccess;

    createTableFailure = function (tx, error) {
        if (error.message.indexOf("already exists") > 0) {
            Hazard.dropTable(createTableSuccess);
            if (rebuild === true) {
                console.log("Rebuilding " + Hazard.TABLE_NAME + " table.");
            } else {
                console.log(Hazard.TABLE_NAME + " table already exists.");
            }
        } else {
            console.error(error.message);
        }
    };

    createTableSuccess = function (tx) {
        tx.executeSql('CREATE TABLE ' + Hazard.TABLE_NAME +
            '(' +
            '  id INTEGER PRIMARY KEY,' +
            '  name varchar(50),' +
            '  type varchar(50),' +
            '  save varchar(255),' +
            '  onset varchar(25),' +
            '  frequency varchar(255),' +
            '  effect ntext' +
            ')', [], success, createTableFailure);
    };

    Database.transaction(createTableSuccess);
};

Hazard.dropTable = function (next) {
    "use strict";
    Database.transaction(function (tx) {
        tx.executeSql('DROP TABLE ' + Hazard.TABLE_NAME, [], next);
    });
};

/**
 * Count the number of records in the table
 * @param next Calls this with the number of records or with -1 on error.
 */
Hazard.countRecords = function (next) {
    "use strict";
    var executeSql, afterSQL;
    var sql = 'SELECT COUNT(*) as count FROM ' + Hazard.TABLE_NAME;

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