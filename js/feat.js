/*globals $, Database*/

function Feat(id, name) {
    "use strict";
    this.id = id || 0;
    this.name = name || "Unnamed Feat";
}

Feat.DATA_URL = "http://home.steelcomputers.com:31338/feats.json";
Feat.TABLE_NAME = "Feats";

Feat.loadData = function () {
    "use strict";
    var featData, addItem, onSqlError;

    addItem = function (tx) {
        var feat = {};
        var sql = 'INSERT INTO ' + Feat.TABLE_NAME +  ' VALUES (?, ?, ?, ?, ?, ?)';
        var key;

        for (key in featData) {
            feat[key] = featData[key].shift();
        }

        if (featData[key].length > 0) {
            tx.executeSql(sql, [null, feat.name, feat.type, feat.source, feat.description,
                feat.benefit], addItem, onSqlError);
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

Feat.createTable = function (success, rebuild) {
    "use strict";
    var createTableFailure, createTableSuccess;

    createTableFailure = function (tx, error) {
        if (error.message.indexOf("already exists") > 0) {
            Feat.dropTable(createTableSuccess);
            if (rebuild === true) {
                console.log("Rebuilding " + Feat.TABLE_NAME + " table.");
            } else {
                console.log(Feat.TABLE_NAME + " table already exists.");
            }
        } else {
            console.error(error.message);
        }
    };

    createTableSuccess = function (tx) {
        tx.executeSql('CREATE TABLE ' + Feat.TABLE_NAME +
            '(' +
            '  id INTEGER PRIMARY KEY,' +
            '  name varchar(50),' +
            '  type varchar(50),' +
            '  source varchar(50),' +
            '  description varchar(50),' +
            '  benefit varchar(50)' +
            ')', [], success, createTableFailure);
    };

    Database.transaction(createTableSuccess);
};

Feat.dropTable = function (next) {
    "use strict";
    Database.transaction(function (tx) {
        tx.executeSql('DROP TABLE ' + Feat.TABLE_NAME, [], next);
    });
};

/**
 * Count the number of records in the table
 * @param next Calls this with the number of records or with -1 on error.
 */
Feat.countRecords = function (next) {
    "use strict";
    var executeSql, afterSQL;
    var sql = 'SELECT COUNT(*) as count FROM ' + Feat.TABLE_NAME;

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
 * @param next The function to call with the matching records
 * @param options Specify filter, skip and limit values.
 */
Feat.GetRecords = function (next, options) {
    "use strict";
    var sql = "SELECT * FROM " + Feat.TABLE_NAME;
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
 * @param next The function to call with the record
 * @param id The record ID to locate
 */
Feat.GetRecord = function (next, id) {
    "use strict";
    var sql = "SELECT * FROM " + Feat.TABLE_NAME + " WHERE id = ?";

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