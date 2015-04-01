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
    }
};