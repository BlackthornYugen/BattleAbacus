app.service('Skill', ["$http", "Database", function ($http, Database) {
    "use strict";
    /**
     * Skill class
     * @param {String} [name=Unnamed Skill] - Name of the Skill
     * @constructor
     */
    function Skill(name) {
        this.id = 0;
        this.name = name || "Unnamed Skill";
    }

    Skill.DATA_URL = "";
    Skill.TABLE_NAME = "Skill";
    return Skill;
}]);