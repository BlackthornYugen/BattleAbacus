/*globals $, Feat, Spell, Hazard, Database, Character*/
var characters = [];

$(function () {
    "use strict";
    // Disable reloading of page content so that form
    // data will persist.
    $.mobile.page.prototype.options.domCache = true;

    Feat.createTable(function () { Feat.loadData(); });
    Spell.createTable(function () { Spell.loadData(); });
    Hazard.createTable(function () { Hazard.loadData(); });
    Character.createTable();

    new Character(); // TODO REMOVE THIS;
    function loadCharacters(tx, response) {
        var i;
        for (i = 0; i < response.rows.length; i++) {
            characters.push(new Character(response.rows.item(i).name));
        }
    }

    Database.transaction(function (tx) {
        var sql = "SELECT name FROM " + Character.TABLE_NAME;
        tx.executeSql(sql, [], loadCharacters, loadCharacters);
    })

    // bind function to displaypage event
    $("body").on("pagebeforechange", function (event, object) {
        var toPage = object.toPage;

        if (typeof toPage === "string") {
            if (/index/.test(toPage)) {
                console.log(object);
            } else if (/feat-all/.test(toPage)) {
                var Entity = Feat;
                var afterSql, nextItem;

                var $fillNode = $("[data-fill=Feats]").removeAttr("data-fill");
                if ($fillNode.length === 1) {
                    Database.transaction(function (tx) {
                        var sql = "SELECT * FROM " + Entity.TABLE_NAME;

                        afterSql = function (tx, response) {
                            if (/SQLError/.test(response)) {
                                console.error(response); // Got an SQL error, dump it to console.
                            } else if (response.rows.length > 0) {
                                nextItem(response, 0);
                            } else {
                                console.error("The following statement yielded no results: \n" + sql);
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

    // Setup menu //
    // Clear and add first char using their large image
    function setupMenu() {

        var $cList = $("#characterList")
            .html('')
            .append($("<img>").attr('src', "http://placehold.it/128.png/F76DD2/fff"));
        $(document).find('a:eq(0)') //TODO: Select an ID instead of the first anchor tag
            .text(characters[0].name);

        // Add char images
        var i;
        var tapEvent = function (event) {
            var name = $(this).data('char').name;
            $(document).find('a:eq(1)') // TODO: Select an ID
                .text(name);
            $(".charName").text(name);
        };

        for (i = 1; i < characters.length; i++) {
            var defaultImage = "http://placehold.it/60.png/F76DD2/fff";
            $cList.append(
                $("<img>")
                    .attr('src', localStorage[characters[i].name] || defaultImage)
                    .css({"max-width": "60px","max-height": "60px"})
                    .attr('title', "Select " + characters[i].name)
                    .data('char', characters[i])
                    .on('tap', tapEvent)
            );
        }

        $cList.append(
            $("<a>")
                .text("+")
                .css("font-size", "3.2em")
                .css("text-decoration", "none")
                .attr('href', 'characters_new.html')
        );
    }

    setTimeout(setupMenu, 300);
});