/*globals $, Feat, Spell, Hazard, Database, Character*/
var characters;

$(function () {
    "use strict";
    // Disable reloading of page content so that form
    // data will persist.
    $.mobile.page.prototype.options.domCache = true;

    Feat.createTable(function () { Feat.loadData(); });
    Spell.createTable(function () { Spell.loadData(); });
    Hazard.createTable(function () { Hazard.loadData(); });
    Character.createTable();

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
    var $cList = $("#characterList")
        .html('')
        .append($("<img>").attr('src', characters[0].pictureLarge));
    $(document).find('a:eq(0)') //TODO: Select an ID instead of the first anchor tag
        .text(characters[0].name.first + " " + characters[0].name.last);

    // Add char images
    var i;
    var tapEvent = function (event) {
        var name = $(this).data('char').name;
        $(document).find('a:eq(1)') // TODO: Select an ID
            .text(name.first + " " + name.last);
        $(".charName").text(name.first + " " + name.last);
    };

    for (i = 1; i < characters.length; i++) {
        $cList.append(
            $("<img>")
                .attr('src', characters[i].pictureSmall)
                .attr('title', "Select " + characters[i].name.first)
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
});

// Sample Data
characters = [
    {
        "_id": "5505c483bcf5e88e7977c786",
        "index": 0,
        "guid": "11855b1f-7384-4ab7-8d5d-dc01598ff33b",
        "isActive": false,
        "balance": "2,573GP 4SP 8CP",
        "colour": "#FA2C2C",
        "pictureLarge": "http://placehold.it/128.png/FA2C2C/fff",
        "pictureSmall": "http://placehold.it/60.png/FA2C2C/fff",
        "level": 5,
        "eyeColor": "blue",
        "name": {
            "first": "Rosario",
            "last": "Garner"
        },
        "about": "Cupidatat voluptate sint mollit aliqua commodo sint non mollit. " +
            "Labore esse id sunt est. Deserunt culpa eiusmod nisi cillum. Irure Lorem " +
            "commodo eiusmod cupidatat ea consequat irure ea adipisicing incididunt ex.\r\n",
        "registered": "Wednesday, August 27, 2014 12:50 AM",
        "tags": [
            "in",
            "do",
            "adipisicing",
            "ad",
            "ex",
            "mollit",
            "in"
        ],
        "favoriteFruit": "apple"
    },
    {
        "_id": "5505c483e70c619a32b0dc30",
        "index": 1,
        "guid": "60240d61-355c-442b-87b1-3420cb7847d2",
        "isActive": false,
        "balance": "$2,857.33",
        "colour": "#F76DD2",
        "pictureLarge": "http://placehold.it/128.png/F76DD2/fff",
        "pictureSmall": "http://placehold.it/60.png/F76DD2/fff",
        "level": 8,
        "eyeColor": "brown",
        "name": {
            "first": "Blevins",
            "last": "Kemp"
        },
        "about": "Proident enim tempor nulla duis commodo. Esse qui ea aliquip fugiat " +
            "non aliqua dolor et. Et laboris ipsum incididunt ipsum commodo ipsum " +
            "consectetur incididunt cupidatat adipisicing aute magna mollit esse. Officia " +
            "eiusmod officia sit aute consequat sunt sint officia dolor. Est do nostrud " +
            "tempor minim magna duis veniam aliqua proident ut. Aliquip officia officia " +
            "laborum laborum dolore reprehenderit culpa cupidatat excepteur aliquip " +
            "pariatur adipisicing. Nulla laborum fugiat ut amet veniam id velit.\r\n",
        "registered": "Friday, July 11, 2014 4:02 PM",
        "tags": [
            "veniam",
            "Lorem",
            "Lorem",
            "sunt",
            "adipisicing",
            "amet",
            "mollit"
        ],
        "favoriteFruit": "apple"
    },
    {
        "_id": "5505c48366481b9c4a0c290e",
        "index": 2,
        "guid": "9f650eed-dee0-4162-a621-452acfc23eb5",
        "isActive": true,
        "balance": "$2,038.44",
        "colour": "#E54B8F",
        "pictureLarge": "http://placehold.it/128.png/E54B8F/fff",
        "pictureSmall": "http://placehold.it/60.png/E54B8F/fff",
        "level": 9,
        "eyeColor": "blue",
        "name": {
            "first": "Benson",
            "last": "Diaz"
        },
        "about": "Non ea aliquip in tempor proident adipisicing aliqua reprehenderit " +
            "aute sunt. Ex deserunt et magna aliqua consequat aliqua deserunt sit. Sit do " +
            "velit quis eiusmod do deserunt aliquip. Dolor velit occaecat nostrud duis " +
            "officia in nisi occaecat nulla nisi excepteur. Excepteur sit amet enim " +
            "cupidatat mollit dolor. Ullamco cupidatat sunt deserunt nostrud.\r\n",
        "registered": "Saturday, June 28, 2014 11:17 PM",
        "tags": [
            "aliquip",
            "ipsum",
            "consectetur",
            "irure",
            "veniam",
            "veniam",
            "excepteur"
        ],
        "favoriteFruit": "apple"
    },
    {
        "_id": "5505c483749e759243a0b7af",
        "index": 3,
        "guid": "c4e49833-617f-4554-86fc-271fd6e38430",
        "isActive": true,
        "balance": "$2,855.04",
        "colour": "#2B4785",
        "pictureLarge": "http://placehold.it/128.png/2B4785/fff",
        "pictureSmall": "http://placehold.it/60.png/2B4785/fff",
        "level": 0,
        "eyeColor": "green",
        "name": {
            "first": "Talley",
            "last": "Pickett"
        },
        "about": "Culpa labore laborum elit irure Lorem id dolore aute adipisicing. " +
            "Dolore consectetur ad sit ullamco dolore exercitation cupidatat ad occaecat " +
            "voluptate. Aliquip eu exercitation culpa consequat mollit. Dolor veniam " +
            "aliqua sint excepteur aliquip laborum qui nulla dolor elit magna. Sit cillum " +
            "minim nisi eiusmod consequat consequat consequat incididunt proident velit eu " +
            "veniam incididunt.\r\n",
        "registered": "Friday, January 16, 2015 2:26 AM",
        "tags": [
            "dolore",
            "est",
            "in",
            "fugiat",
            "commodo",
            "irure",
            "sunt"
        ],
        "favoriteFruit": "apple"
    },
    {
        "_id": "5505c4839933c829435f10b0",
        "index": 4,
        "guid": "e0cf7d5e-3de8-4f68-bd20-56c3e56da4e6",
        "isActive": false,
        "balance": "$3,787.12",
        "colour": "#39DD87",
        "pictureLarge": "http://placehold.it/128.png/39DD87/fff",
        "pictureSmall": "http://placehold.it/60.png/39DD87/fff",
        "level": 9,
        "eyeColor": "brown",
        "name": {
            "first": "Anna",
            "last": "Hart"
        },
        "about": "Excepteur ad ad laboris dolor elit deserunt id nisi exercitation " +
            "magna cillum incididunt do mollit. Culpa laboris incididunt ad in occaecat id " +
            "cupidatat deserunt mollit. Ad duis do deserunt labore in irure labore culpa " +
            "sunt.\r\n",
        "registered": "Sunday, November 16, 2014 8:58 AM",
        "tags": [
            "amet",
            "veniam",
            "qui",
            "officia",
            "ullamco",
            "ipsum",
            "fugiat"
        ],
        "favoriteFruit": "strawberry"
    },
    {
        "_id": "5505c483229ee0e553e76f94",
        "index": 5,
        "guid": "1e4469e2-57a8-48a9-b69b-16d669f1b494",
        "isActive": false,
        "balance": "$1,463.84",
        "colour": "#D27848",
        "pictureLarge": "http://placehold.it/128.png/D27848/fff",
        "pictureSmall": "http://placehold.it/60.png/D27848/fff",
        "level": 0,
        "eyeColor": "brown",
        "name": {
            "first": "Wyatt",
            "last": "Whitfield"
        },
        "about": "Sit dolor velit irure cillum Lorem tempor nulla quis aliquip. Est " +
            "elit consectetur sint voluptate. Ex occaecat laborum qui ex veniam ut " +
            "voluptate consectetur nisi cupidatat elit nulla occaecat nulla.\r\n",
        "registered": "Monday, June 2, 2014 9:32 AM",
        "tags": [
            "Lorem",
            "in",
            "laboris",
            "sint",
            "labore",
            "amet",
            "excepteur"
        ],
        "favoriteFruit": "banana"
    }
];