function Character(name) {
    "use strict";
    this.name = name || "Unnamed Character";
}

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

// TODO: DELETE TEST CODE
window.a = new Character("Bill");
window.b = new Character("Bob");