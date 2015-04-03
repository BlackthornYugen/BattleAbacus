/*globals $, Database*/
/**
 * Hazard Class
 * @param {String} [name=Unnamed Hazard] - The name for the Hazard
 * @constructor
 */
function Hazard(name) {
    "use strict";
    this.id = 0;
    this.name = name || "Unnamed Hazard";
}

Hazard.DATA_URL = "http://home.steelcomputers.com:31338/hazards.json";
Hazard.TABLE_NAME = "Hazards";

/**
 * Load json data and insert it into websql
 */
Hazard.loadData = function () {
    "use strict";
    var hazardData, addItem, onSqlError;

    addItem = function (tx) {
        var hazard = {};
        var sql = 'INSERT INTO ' + Hazard.TABLE_NAME +  ' VALUES (?, ?, ?, ?, ?, ?, ?)';
        var key;

        for (key in hazardData) {
            hazard[key] = hazardData[key].shift();
        }

        if (hazardData[key].length > 0) {
            tx.executeSql(sql, [null, hazard.name, hazard.type, hazard.save, hazard.onset,
                hazard.frequency, hazard.effect], addItem, onSqlError);
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
            hazardData = data;
            Database.transaction(function (tx) {
                addItem(tx);
            });
        }
    });
};

/**
 * Create table
 * @param {Function} success - Executed when the table is created
 * @param {Boolean} rebuild - Drop the previous table
 */
Hazard.createTable = function (success, rebuild) {
    "use strict";
    var createTableFailure, createTableSuccess;

    createTableFailure = function (tx, error) {
        if (error.message.indexOf("already exists") > 0) {
            if (rebuild === true) {
                rebuild = false;
                Hazard.dropTable(createTableSuccess);
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

/**
 * Drop table
 * @param {Function} next - Executed when the table is dropped
 */
Hazard.dropTable = function (next) {
    "use strict";
    Database.transaction(function (tx) {
        tx.executeSql('DROP TABLE ' + Hazard.TABLE_NAME, [], next);
    });
};

/**
 * Count the number of records in the table
 * @param {Function} next - Calls this with the number of records or with -1 on error.
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

/**
 * Get all records
 * @param {Function} next - The function to call with the matching records
 * @param {{filter: string, skip: number, limit: number}} options
 */
Hazard.GetRecords = function (next, options) {
    "use strict";
    var sql = "SELECT * FROM " + Hazard.TABLE_NAME;
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
        + (options.limit || DEFAULT_LIMIT) +  ";";
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
            console.error("The following statement yielded no results: \n" + sql);
        }
    };
};

/**
 * Get the record that matches a specific ID
 * @param {Function} next - The function to call with the record
 * @param (Number|String) id - The record ID to locate
 */
Hazard.GetRecord = function (next, id) {
    "use strict";
    var sql = "SELECT * FROM " + Hazard.TABLE_NAME + " WHERE id = ?";

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