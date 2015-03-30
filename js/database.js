/**
 * Created by John on 2015-03-30.
 */
/*globals openDatabase */
function Database() {
    "use strict";
    this.name = ""; //TODO: Initialize Database Object
}

Database.connection = openDatabase('battleAbacus', '1', 'Battle Abacus', 5 * 1024 * 1024);