/*globals $, Feat, Spell, Hazard, Database, Character*/
var characters = [];

$(function () {
    "use strict";
    Feat.createTable(function () { Feat.loadData(); });
    Spell.createTable(function () { Spell.loadData(); });
    Hazard.createTable(function () { Hazard.loadData(); });
    Character.createTable();

    function loadCharacters(tx, response) {
        var i;
        for (i = 0; i < response.rows.length; i++) {
            characters.push(new Character(response.rows.item(i).name));
        }
    }

    Database.transaction(function (tx) {
        var sql = "SELECT name FROM " + Character.TABLE_NAME;
        tx.executeSql(sql, [], loadCharacters, loadCharacters);
    });

    // bind function to displaypage event
    $("body").on("pagebeforechange", function (event, object) {
        var toPage = object.toPage;

        if (typeof toPage === "string") {
            if (/index/.test(toPage)) {
                console.log(object);
            } else if (/feat-all\.html/.test(toPage)) {
                var Entity = Feat;
                var afterSql, nextItem;

                var $fillNode = $("[data-fill=Feats]").removeAttr("data-fill");
                $fillNode.on('tap', 'tr', function () {
                    var featName = $(this).find('td').eq(0).text();
                    var featId = this.id.replace("FEAT_", '');
                    var userResponse = confirm("Add " + featName + " to your character?");
                    if (userResponse === true) {
                        characters[0].addFeat(featId);
                    }
                });
                if ($fillNode.length === 1) {
                    Database.transaction(function (tx) {
                        var sql = "SELECT * FROM " + Entity.TABLE_NAME;

                        afterSql = function (tx, response) {
                            if (/SQLError/.test(response)) {
                                console.error(response); // Got an SQL error, dump it to console.
                            } else if (response.rows.length > 0) {
                                nextItem(response, 0);
                            } else {
                                console.info("The following statement yielded no results: \n" + sql);
                            }
                        };

                        nextItem = function (response, position) {
                            var item = response.rows.item(position);
                            var rowId = "FEAT_" + item.id;

                            $fillNode.append(
                                $("<tr>").attr('id', rowId).append(
                                    $("<td>").text(item.name),
                                    $("<td>").text(item.type),
                                    $("<td>").text(item.source)
                                )
                            );

                            if (position + 1 < response.rows.length) {
                                nextItem(response, position + 1);
                            }
                        };

                        tx.executeSql(sql, [], afterSql, afterSql);
                    });
                }
                console.log(object);
            }
        }
    });
});



/**
 * Setup the char select menu
 *
 */
function setupMenu() {
    "use strict";
    var $cList = $("#characterList")
        .html('');
    if (characters.length > 0) {
        $cList.append($("<img>")
                .attr('src', localStorage[characters[0].name] || "http://placehold.it/128.png/F76DD2/fff")
                .css({"max-width": "128px", "max-height": "128px"}));

        // Add char images
        var i, defaultImage;
        var tapEvent = function (event) {
            var name = $(this).data('char').name;
            $(document).find('a:eq(1)') // TODO: Select an ID
                .text(name);
            for (i = 1; i < characters.length; i++) {
                if (characters[i].name === name) {
                    break;
                }
            }
            characters.unshift(characters.splice(i, 1)[0]);
            setupMenu();
            $(".charName").text(name);
        };

        for (i = 1; i < characters.length; i++) {
            defaultImage = "http://placehold.it/60.png/F76DD2/fff";
            $cList.append(
                $("<img>")
                    .attr('src', localStorage[characters[i].name] || defaultImage)
                    .css({"max-width": "60px", "max-height": "60px"})
                    .attr('title', "Select " + characters[i].name)
                    .data('char', characters[i])
                    .on('tap', tapEvent)
            );
        }
    }
    $cList.append(
        $("<a>")
            .text("+")
            .css("font-size", "3.2em")
            .css("text-decoration", "none")
            .attr('href', 'characters_new.html')
    );
}