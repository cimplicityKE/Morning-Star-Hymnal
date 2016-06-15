Parse.initialize("", "");
$(document).ready(function () {

    if (window.indexedDB) {
        console.log("IndexedDB support confirmed");
    } else {
        intel.xdk.notification.alert("Sorry, the type of database (IndexedDB) used by this app is not supported in your phone. Update to the latest mobile firefox or chrome browser to allow IndexedDb support. We are working hard to ensure that support in all phones. Thank you.");
        window.close();
    }

    //open database
    var request = indexedDB.open('songs', 1);

    request.onupgradeneeded = function (e) {
        var db = e.target.result;


        if (!db.objectStoreNames.contains('songs_table')) {
            var store = db.createObjectStore('songs_table', {
                keyPath: 'id',
                autoIncrement: true
            });


            console.log("The library table has been created");

            store.createIndex("title", "title", {
                unique: false
            });
            store.createIndex("chorus", "chorus", {
                unique: false
            });
            store.createIndex("verses", "verses", {
                unique: false
            });

        }

        if (!db.objectStoreNames.contains('service_table')) {
            var store2 = db.createObjectStore('service_table', {
                keyPath: 'id',
                autoIncrement: true
            });

            store2.createIndex("hymn_id", "hymn_id", {
                unique: false
            });
            store2.createIndex("hymn_title", "hymn_title", {
                unique: false
            });
            store2.createIndex("hymn_chorus", "hymn_chorus", {
                unique: false
            });
            store2.createIndex("hymn_verses", "hymn_verses");
        }
    }

    //success
    request.onsuccess = function (e) {
        console.log("Success: Opened Database...");
        db = e.target.result;

        //empty_program_notification();
        show_Songs();
        add_database();
        load_program();
        no_of_hymns();
        //save_to_program();
        //delete_program();
        // delete_database();

    }

    //error
    request.onerror = function (e) {
        alert("Sorry! Could not open database...");
    }


    morning_star = Parse.Object.extend("morning_star");

    $("#saveSong").on("submit", function (e) {
        e.preventDefault();

        //Grab the note details, no real validation for now
        var category = "<pre class=\"fonts fonts_title\">" + document.querySelector("#category_song").value + "</pre>";
        var title = "<pre class=\"fonts fonts_title\">" + document.querySelector("#title_song").value + "</pre>";
        var chorus = "<pre class=\"fonts fonts_chorus\">" + document.querySelector("#chorus_song").value + "</pre>";
        var verses = "<pre class=\"fonts font_verses\">" + document.querySelector("#verses_song").value + "</pre>";

        var songs = new morning_star();
        songs.save({
            category: category,
            title: title,
            chorus: chorus,
            verses: verses
        }, {
            success: function (object) {
                console.log("Saved the object!");
                $("#category_song").val("");
                $("#title_song").val("");
                $("#chorus_song").val("");
                $("#verses_song").val("");
                update_library();
                $.mobile.changePage("#add_newsong", {
                    transition: "fade"
                });
            },
            error: function (object, error) {
                alert("Sorry, We couldn't save the song. Please try again.");
            }
        });
    });
});

function delete_program() {
    var write_transition = db.transaction("service_table", "readwrite");
    var store = write_transition.objectStore("service_table");
    var delete_all_rows = store.clear();
    delete_all_rows.onsuccess = function (event) {
        console.log("Deleted all rows");
        $("#clear_program").hide();
    }
    document.querySelector("#service_list").innerHTML = "";
}

function empty_program_notification() {
    $("#service_body").append("<h3 id=\"song_body_text\" class=\"hymn_title\">There is no hymn on the program.</h3><span class=\"hymn_id\"</span><p class=\"song_paragraph\"><br>Select a hymn from the library,<br> show on stage and then<br> add to program.</p>");
    $("#clear_program").hide();
    document.querySelector("#song_body_text").innerHTML = "";
}

function delete_library() {
    var write_transition = db.transaction("songs_table", "readwrite");
    var store = write_transition.objectStore("songs_table");
    var delete_all_rows = store.clear();
    delete_all_rows.onsuccess = function (event) {
        console.log("Deleted all rows");
    }
}

function add_database(results) {
    db.transaction(["songs_table"], "readwrite").objectStore("songs_table").openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        //if there are records in the database, then don't update.
        if (!cursor) {
            var query = new Parse.Query(morning_star);
            query.limit(1000);
            query.find({
                success: function (results) {
                    var transaction = db.transaction(["songs_table"], "readwrite");

                    //ask for objectstore
                    var store = transaction.objectStore("songs_table");
                    var s;
                    for (var i = 0, len = results.length; i < len; i++) {
                        var result = results[i];
                        console.dir(result);

                        var id = result.attributes.id;
                        var category = result.attributes.category;
                        var title = result.attributes.title;
                        var chorus = result.attributes.chorus;
                        var verses = result.attributes.verses;

                        var song = {
                            category: category,
                            title: title,
                            chorus: chorus,
                            verses: verses
                        };
                        var request = store.add(song);

                        request.onsuccess = function (e) {
                            update_library();
                        }

                        request.onerror = function (e) {
                            window.alert("Sorry, it appears there was a problem adding the song. Adding Failed. ");
                        }
                    }
                }
            });
        }
    }
}

function library_update_notification() {
    //Go to Homepage
    $.mobile.changePage("#home");
    $.mobile.showPageLoadingMsg("b", "The library is updating. Please wait for a few moments.", true);
}

function update_library() {

    //hide main menu links
    $("#hymnal").hide();
    $("#settings").hide();
    $("#about").hide();
    $.mobile.changePage("#settings");
    db.transaction(["songs_table"], "readwrite").objectStore("songs_table").openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        //if there are records in the database, then don't update.
        if (window.navigator.onLine == true) {
            delete_program();
            delete_library();
            var query = new Parse.Query(morning_star);
            query.limit(1000);
            query.find({
                success: function (results) {
                    var transaction = db.transaction(["songs_table"], "readwrite");

                    //ask for objectstore
                    var store = transaction.objectStore("songs_table");
                    var s;
                    for (var i = 0, len = results.length; i < len; i++) {
                        var result = results[i];
                        console.dir(result);

                        var id = result.attributes.id;
                        var title = result.attributes.title;
                        var chorus = result.attributes.chorus;
                        var verses = result.attributes.verses;

                        var song = {
                            title: title,
                            chorus: chorus,
                            verses: verses
                        };
                        var request = store.add(song);

                        request.onsuccess = function (e) {

                            //show_Songs();
                            location.reload();
                            //hide main menu links

                            //Go to Homepage
                            console.log("The songs were successfully added.");
                        }

                        request.onerror = function (e) {
                            intel.xdk.notification.alert("Sorry, the song was not added.");
                            console.log('Error', e.target.title);
                        }
                    }
                }
            });

        } else {
            alert("Sorry, Update failed since there was not internet connection.");
        }
    }
    console.log("Just performed the update successfully!");
    $("#hymnal").show();
    $("#settings").show();
    $("#about").show();
}

function service_text(x) {
    var request = indexedDB.open('songs', 1);
    var db;
    request.onerror = function (e) {
        console.log("Unable to retrieve data from database!");
    };
    request.onsuccess = function (e) {
        db = request.result;
        var read_transition = db.transaction("songs_table", "readonly");
        var store = read_transition.objectStore("songs_table");
        var row = store.get(x);
        row.onsuccess = function (e) {
            document.querySelector("#song_body").innerHTML = "<h2 class=\"fonts_title stage_title\">" + row.result.title + "</h2><span id=\"id\">" + row.result.id + "</span><i><h4 class=\"fonts_chorus stage_chorus\">" + row.result.chorus + "</i></h4><p class=\"\"><i class=\"stage_verses\">" + row.result.verses + "</i></p>";
            //Hide Hymn_id element
            $("#hymn_id").hide();
            //$("#add_to_program").show();
        };
        $.mobile.changePage("#stage");
    }
}

function show_text(x) {
    var request = indexedDB.open('songs', 1);
    var db;
    request.onerror = function (e) {
        console.log("Unable to retrieve data from database!");
    };
    request.onsuccess = function (e) {
        db = request.result;
        var read_transition = db.transaction("songs_table", "readonly");
        var store = read_transition.objectStore("songs_table");
        var row = store.get(x);
        row.onsuccess = function (e) {
            document.querySelector("#song_body").innerHTML = "<h2 class=\"fonts_title stage_title\">" + row.result.title + "</h2><span id=\"hymn_id\">" + row.result.id + "</span><i><h4 class=\"fonts_chorus stage_chorus\">" + row.result.chorus + "</i></h4><div class=\"stage_verses\"><p><i class=\"fonts_verses\">" + row.result.verses + "</i></p></div>";
            //Hide Hymn_id element
            $("#hymn_id").hide();
            $("#add_to_program").show();
        };
        $.mobile.changePage("#stage");
        console.log("Display of verses successful!");
    }
}

function save_to_program() {

    var hymn_id = $("#hymn_id").html();
    var hymn_title = $(".stage_title").html();
    var hymn_chorus = $(".stage_chorus").html();
    var hymn_verses = $(".stage_verses").html();

    var id = hymn_id;
    var title = hymn_title;

    var request = db.transaction(["service_table"], "readwrite").objectStore("service_table").add({
        hymn_id: hymn_id,
        hymn_title: hymn_title
    });

    request.onsuccess = function (event) {
        $("#service_list").append("<li onClick=\"show_text(" + hymn_id + ")\"><a><span class=\"list_title\">" + hymn_title + "</span></a></li>").listview('refresh');

        $("#song_body_text").hide();
        $(".song_paragraph").hide();

        $("#hymn_id").hide();

        $("#add_to_program").show();


    }
    request.onerror = function (event) {
        console.log("There was an error");
    };
    $("#clear_program").show();
}

complete: function load_program() {
    var output = '';
    $("#add_to_program").hide();
    $("#clear_program").hide();
    /*var a = $("#song_body").html();
        if (a==""){
            $("#clear_program").hide();
            $("#add_to_program").hide();
        }*/
    db.transaction(["service_table"], "readonly").objectStore("service_table").openCursor().onsuccess = function (e) {
        var cursor = e.target.result;

        //var x = cursor.value.id;
        if (cursor) {
            output += "<li onClick=\"show_text(" + cursor.value.hymn_id + ")\"><a><span class=\"list_title\">" + cursor.value.hymn_title + "</span></a></li>";
            cursor.continue();
            $("#clear_program").show();
        }
        document.querySelector("#service_list").innerHTML = output;
        $("#song_body_text").show();

    }
}

function add_service() {
    db.transaction(["service_table"], "readwrite").objectStore("service_table").openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        var transaction = db.transaction(["service_table"], "readwrite");

        //ask for objectstore
        var store = transaction.objectStore("service_table");


        var service_song = service_hymn;

        var song = {
            service_song: service_song
        };
        var request = store.add(song);

        request.onsuccess = function (e) {
            //intel.xdk.notification.confirm("The song was successfully added.");

            console.log("The service song was successfully added.");
        }

        request.onerror = function (e) {
            intel.xdk.notification.alert("Sorry, the service song was not successfully added.");
            console.log('Error', e.target.title);
        }
    }
}

function fetch_data() {
    var service_hymn = document.getElementsByClassName('list_title').innerHTML;
    console.log(service_hymn);
}


function show_service() {
    var output = '';
    db.transaction(["service_table"], "readonly").objectStore("service_table").openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {
            //var x = cursor.value.service_song;
            output += "<a><li onClick=\"service_text(" + cursor.value.id + ")\">Song " + cursor.value.id + "</li></a>";
            cursor.continue();
        }
        document.querySelector("#service_list").innerHTML = output;
    }
}


//show songs on library
function show_Songs() {
    var output = '';
    db.transaction(["songs_table"], "readonly").objectStore("songs_table").openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {
            var x = cursor.value.id;
            //var z = cursor.value.title;
            output += "<li onClick=\"show_text(" + cursor.value.id + ")\"><a><span class=\"list_title\">" + cursor.value.title + "</span></a></li>";
            cursor.continue();
        }
        document.querySelector("#song_list").innerHTML = output;
    }
    $.mobile.changePage("#home");
}

function show_stage() {
    $.mobile.changePage("#stage", {
        transition: "fade"
    });
}


function go_back() {
    $.mobile.back();
    document.querySelector("#song_body").innerHTML = "<h3 id=\"song_body_text\">There is no item on stage!</h3><p id=\"song_body_text\">Select a song <br>from the Library <br>and show on stage.</p>";
}


function delete_database() {
    var DBDeleteRequest = window.indexedDB.deleteDatabase("songs");

    DBDeleteRequest.onerror = function (event) {
        console.log("Error deleting database.");
    };

    DBDeleteRequest.onsuccess = function (event) {
        console.log("Database deleted successfully");
    };
}

//Get no. of hymns and display in about section
function no_of_hymns() {
    db.transaction(["songs_table"], "readonly").objectStore("songs_table").count().onsuccess = function (event) {
        $("#no_of_hymns").text(" " + event.target.result + ".");
    };
}

//Hide add to program button if stage has no button
var q = $("#song_body_text").html();

if (q == "There is no item on stage!") {
    $("#add_to_program").hide();
}

$("#show_on_stage").click(function () {
    $.mobile.changePage("#stage", {
        transition: "slide"
    });
});

$("#stage_button").click(function () {
    $.mobile.changePage("#stage", {
        transition: "slide"
    });
});

$("#service_button").click(function () {
    $.mobile.changePage("#service", {
        transition: "slide"
    });
});

$("#library_button").click(function () {
    $.mobile.changePage("#library", {
        transition: "slide"
    });
});

$("#settings_button").click(function () {
    $.mobile.changePage("#settings", {
        transition: "slide"
    });
});
