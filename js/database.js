/*globals openDatabase */
var Database = {
    connection: openDatabase('battleAbacus', '1', 'Battle Abacus', 5 * 1024 * 1024),

    transaction: function (func) {
        "use strict";
        this.connection.transaction(func);
    },

    /**
     * Confirm that the table exists and has a specified number of records
     *
     * @param table The table to verify records for.
     * @param recordCount
     * @param success
     * @param fail
     */
    verifyRecords: function (table, recordCount, success, fail) {
        "use strict";
        if (!table) {
            throw "Table not provided";
        }

        if (/^\d+$/.test(recordCount)) {
            recordCount = 1; // recordCount wasn't positive number.
        }

        this.connection.transaction(function (tx) {
            tx.executeSql("", []);
        });
    },

    /**
     * Add an id to a joined table
     * @param {{idA: (String|Number), idB: (String|Number), idsArray: Number[],
     *          tableNameA: String, tableNameB: String}} itemObject
     * @param {Function} [success] - Executed after success
     */
    addJoinedItem: function (itemObject, success) {
        "use strict";
        if (!itemObject) {
            throw "Invalid object";
        }

        if (!itemObject.idA || !itemObject.idB) {
            throw "Invalid ID";
        }

        if (!itemObject.tableNameA || !itemObject.tableNameB) {
            throw "Invalid Table Name";
        }

        var sql = "INSERT INTO " + itemObject.tableNameA + itemObject.tableNameB + "(" +
            itemObject.tableNameA + "Id, " + itemObject.tableNameB + "Id) VALUES (?, ?)";

        var afterSql = function (tx, response) {
            if (/SQLError/.test(response)) {
                throw response.message;
            }

            var rowsAffected = response.rowsAffected;

            console.log((rowsAffected === 1 ?
                    "A record was " : rowsAffected + " records ") +
                    "inserted into " + itemObject.tableNameA + itemObject.tableNameB + ".");

            // TODO: Stop dumping SQL to console.
            console.log(sql.replace("?", itemObject.idA).replace("?", itemObject.idB));

            if (rowsAffected > 0) {
                itemObject.idsArray.push(itemObject.idB);
                if (success) {
                    success();
                }
            }
        };

        // If item not already added, add it to object & persist to websql
        if (itemObject.idsArray.indexOf(itemObject.idB) === -1) {
            Database.transaction(function (tx) {
                tx.executeSql(sql, [itemObject.idA, itemObject.idB], afterSql, afterSql);
            });
        } else {
            console.log(itemObject.tableNameB + " " + itemObject.idB +
                " already exists in " + itemObject.tableNameA + " " + itemObject.idA);
        }
    },

    /**
     * Remove an id from a joined table
     * @param {{idA: (String|Number), idB: (String|Number), idsArray: Number[],
     *          tableNameA: String, tableNameB: String}} itemObject
     * @param {Function} [success] - Executed after success
     */
    removeJoinedItem: function (itemObject, success) {
        "use strict";
        var joinTableName = itemObject.tableNameA + itemObject.tableNameB;
        var arrayIndex = itemObject.idsArray.indexOf(itemObject.idB);
        var sql = "DELETE FROM " + joinTableName + " WHERE " +
            itemObject.tableNameA + "Id = ? AND " + itemObject.tableNameB + "Id = ?";

        itemObject.idsArray.splice(arrayIndex, 1); // TODO: Only remove successful SQL delete

        var afterSql = function (tx, response) {
            if (/SQLError/.test(response)) {
                throw response.message;
            }

            console.log((response.rowsAffected === 1 ?
                    "A record was " : response.rowsAffected + " records ") +
                    "deleted from " + joinTableName + ".");

            if (success && response.rowsAffected > 0) {
                success();
            }
        };

        Database.transaction(function (tx) {
            tx.executeSql(sql, [itemObject.idA, itemObject.idB], afterSql, afterSql);
        });
    }
};