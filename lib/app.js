/*
Main App file 
*/

// jQuery plugin - Encode a set of form elements as a JSON object for manipulation/submission.
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Define the app as a object to take out of global scope
var app = {

    findAll: function() {
        console.log('DEBUG - 2. findAll() triggered');

        this.sitestore.findAll(function(sites) {
            var l = sites.length;
            var td;

            // Create new arrays so we can order them with outstanding first
            outstanding = [];
            completed = [];
            allsites = [];

            // Loop through sites, build up lis and push to arrays
            for (var i=0; i<l; i++) {
                td = sites[i];

                // If not completed
                if (td.status == 0) {

             outstanding.push('<li data-row-id="' + td.id +
'" class="outstanding" name="liv"><a href="#PageItems"  data-viewitems-id="'+td.id+'" class="viewitems" name="v"><img name="sitepicture" class="cover" src="'+td.picture+'"/>'+
'<h3>'+td.title+'</h3>'+
'<p>'+td.description+'</p></a>'+
'<div class="split-custom-wrapper">'+
'<a href="#PageSite" data-role="button" class="viewsite split-custom-button ui-btn ui-btn-up-c ui-shadow ui-btn-corner-all ui-btn-icon-notext" data-icon="gear" data-theme="c" data-iconpos="notext" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" title="" data-transition="slide" data-viewsite-id="' + td.id +'">'+
'<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text"></span><span class="ui-icon ui-icon-gear ui-icon-shadow">&nbsp;</span></span></a>'+
'<a href="#" data-role="button" class="split-custom-button ui-btn ui-btn-up-c ui-shadow ui-btn-corner-all ui-btn-icon-notext" data-icon="minus" data-theme="c" data-iconpos="notext" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" title="">'+
'<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text"></span><span class="ui-icon ui-icon-minus ui-icon-shadow">&nbsp;</span></span></a>'+
'</div></li>');
                }
                // If is completed
                else {

                }
            }

            // Join both arrays
            allsites = outstanding.concat(completed);

            // Remove any previously appended
            $('.site-listview li').remove();

            // Append built up arrays to ULs here.
            $('.site-listview').append(allsites);            

            // Refresh JQM listviewsite
            $('.site-listview').listview('refresh');
        });
    },

    findById: function(id) {
        
        this.sitestore.findById(id, function(result) {
            $('#edit').find('input[name="id"]').val(id);
            $('#edit').find('input[name="title"]').val(result.title);
            $('#edit').find('input[name="title"]').attr('data-id',id);
            $('#edit').find('textarea[name="description"]').val(result.description);
            $('#edit').find('input[name="picture"]').val(result.picture);
            $('#sitepicture').find('img[name="pictureimg"]').attr('src',result.picture);
            //$('#title').val(result.title);
            //$('#title').attr('data-id', id);
            //$('#description').val(result.description);
            //$('#id').val(id);
       
        });
    },
    findItemsBySiteId: function(id) {
        
        this.sitestore.findById(id, function(result) {
            $('#edit').find('input[name="id"]').val(id);
            $('#edit').find('input[name="title"]').val(result.title);
            $('#edit').find('input[name="title"]').attr('data-id',id);
            $('#edit').find('textarea[name="description"]').val(result.description);
            $('#edit').find('input[name="picture"]').val(result.picture);
            $('#sitepicture').find('img[name="pictureimg"]').attr('src',result.picture);
            //$('#title').val(result.title);
            //$('#title').attr('data-id', id);
            //$('#description').val(result.description);
            //$('#id').val(id);
       
        });
    },

    
    
    markCompleted: function(id) {

        // Passing json as any store will be able to handle it (even if we change to localStorage etc)
        this.sitestore.markCompleted(id, function(result) {

            // DB updates successful
            if(result) {
                console.log("DEBUG - Success, db updated and marked as completed");

                // Find original row and grab details
                var originalRow =  $('#home *[data-row-id="'+id+'"]'),
                    title = originalRow.find("h2").text(),
                    desc = originalRow.find("p").text();

                // Remove from pending row
                originalRow.remove();

                // Re-build the li rather than clone as jqm generates a lot of fluff
                var newRow = '<li data-row-id="' + id + '" class="completed"><a href="viewsite" data-transition="slide" class="viewsite" data-viewsite-id="' + id +'"><h2>' + title + '</h2><p>' + desc + '</p></a><a href="#" data-icon="delete" data-iconpos="notext" class="mark-outstanding" data-mark-id="' + id +'">Mark as outstanding</a></li>';

                // Add to completed
                $('.site-listview').append(newRow);

                // Refresh dom
                $('.site-listview').listview('refresh');

                // Kept for debugging use
                //console.log("id length = " + $('[data-row-id='+id+']').length);

            } else {
                alert("Error - db did not update and NOT marked as completed");
            }
        });
    },

    markOutstanding: function(id) {

        // Passing json as any store will be able to handle it (even if we change to localStorage, indexedDB etc)
        this.sitestore.markOutstanding(id, function(result) {

            // DB updates successful
            if(result) {
                console.log("DEBUG - Success, db updated and marked as outstanding");

                // Find original row and grab details
                var originalRow =  $('*[data-row-id="'+id+'"]'),
                    title = originalRow.find("h2").text(),
                    desc = originalRow.find("p").text();

                // Remove from pending row
                originalRow.remove();

                // Re-build the li rather than clone as jqm generates a lot of fluff
                var newRow = '<li data-row-id="' + id + '" class="outstanding"><a href="viewsite" data-transition="slide" class="viewsite" data-view-id="' + id +'"><h2>' + title + '</h2><p>' + desc + '</p></a><a href="#" data-icon="check" data-iconpos="notext" class="mark-completed" data-mark-id="' + id +'">Mark as completed</a></li>';

                // Add to completed
                $('.site-listview').prepend(newRow);

                // Refresh dom
                $('.site-listview').listview('refresh');

                // Kept for debugging use
                //console.log("id length = " + $('[data-row-id='+id+']').length);

            } else {
                alert("Error - db did not update and NOT marked as outstanding");
            }
        });
    },

    insert: function(json) {

        // Passing json as any store will be able to handle it (even if we change to localStorage etc)
        this.sitestore.insert(json, function(result) {

            // On successful db insert
            if(result) {
                console.log("DEBUG - Success,  add returned true");

                // Redirect back to #home page, add a transition andchange the hash
                $.mobile.changePage( $("#PageSites"), {
                    transition: "slide",
                    reverse: true,
                    changeHash: true,
                });

            } else {
                alert("Error on insert!");
            }
        });
    },

    update: function(json) {

        // Passing json as any store will be able to handle it (even if we change to localStorage etc)
        this.sitestore.update(json, function(result) {

            // On succuessful db update
            if(result) {
                console.log("DEBUG - Success, updated returned true");
            } else {
                alert("Error on update!");
            }
        });
    },
    delete: function(json) {

        // Passing json as any store will be able to handle it (even if we change to localStorage etc)
        this.sitestore.delete(json, function(result) {

            // On successful db delete
            if(result) {
                console.log("DEBUG - Success, delete returned true");

                // Redirect back to #home page
                $.mobile.changePage( $("#PageSites"), {
                    transition: "slide",
                    reverse: true,
                    changeHash: true
                });

            } else {
                alert("Error on delete!");
            }
        });
    },    
getNewPicture: function(){
    //alert(window.sessionStorage.getItem('webmobile'));
    if(window.sessionStorage.getItem('webmobile')==0 || window.sessionStorage.getItem('webmobile')==undefined ){
        var answer = confirm ("Use camera?");
        if (answer){
              navigator.camera.getPicture(app.getNewPictureSize,
            app.onGetPictureFail,
            {quality: 50, destinationType: navigator.camera.DestinationType.DATA_URL,
             sourceType:navigator.camera.PictureSourceType.CAMERA,saveToPhotoAlbum: true });}
        else
        {
            navigator.camera.getPicture(app.getNewPictureSize,
            app.onGetPictureFail, 
            {quality: 50, destinationType: navigator.camera.DestinationType.DATA_URL,
             sourceType:navigator.camera.PictureSourceType.SAVEDPHOTOALBUM });
        }
    }
    else{
        //document.getElementsByName("picturefile").click();
        $('[name="picturefile"]').click();
    }
},	
getNewPictureSize:function(imageData){

        var img = document.createElement("img");
        
        img.src = "data:image/jpeg;base64," + imageData;
        console.log(img.src);
        var canvas = document.createElement("canvas");
        //var canvas = $("<canvas>", {"id":"testing"})[0];
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var MAX_WIDTH = 400;
        var MAX_HEIGHT = 400;
        var width = img.width;
        var height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        var dataurl = canvas.toDataURL("image/png");  
        $('[name="pictureimg"]').attr('src',dataurl);
        $('[name="picture"]').val(dataurl);        
           
},
getNewDesktopPicture: function(input){
 
    if ( input.files && input.files[0] ) {
        var FR= new FileReader();
        FR.onload = function(e) {
            var src=e.target.result;
            app.getNewPictureSize(src.replace(/^data:image\/(png|jpeg|jpg|bmp);base64,/, ""));
        };       
        FR.readAsDataURL( input.files[0] );
    }  
},
onGetPictureFail: function(message) {
      alert('Failed because: ' + message);
    },


    initialize: function() {
        // Create webmobile indicator
        window.sessionStorage.setItem('webmobile',0);
        
        // Create a new store
        this.sitestore = new SiteStorageDB();
        this.itemstore = new ItemStorageDB();

        // Bind all events here when the app initializes
        $(document).on('pagebeforeshow', '#PageSites', function(event) {
            console.log("DEBUG - 1. Home pageinit bind");
            app.findAll();
        });

        $(document).on('click', '.viewsite', function(event) {
            console.log("DEBUG - Trying to access viewsite");
            //alert($(this).data('viewsite-id'));
            if($(this).data('viewsite-id')==undefined){
            convertImgToBase64('./img/questionmark.png', function(base64Img){
            console.log(base64Img);
            // Base64DataURL
                $('#edit').find('input[name="picture"]').val(base64Img);
                $('#sitepicture').find('img[name="pictureimg"]').attr('src',base64Img);
            });
            }
            else{
                app.findById($(this).data('viewsite-id'));
            }
        });
        $(document).on('click', '.viewitems', function(event) {
            ($('a[name="siteanchor"]').attr('data-viewsite-id',$(this).data('viewitems-id')));            
            ($('h3[name="sitetitle"]').text($(this).find('h3').text()));
            ($('p[name="sitedescription"]').text($(this).find('p').text()));
            ($('img[name="sitepicture"]').attr('src',$(this).find('img').attr('src')));
            //alert($(this).find('img').attr('name'));

        });
        $(document).on('click', '.save', function(event) {
            console.log("DEBUG - Trying to save via the save method");
            if($('#edit').find('input[name="id"]').val()==0){
                var data = JSON.stringify($('#edit').serializeObject()); 
                console.log(data);
                app.insert(data);
            }
            else{
                var data = JSON.stringify($('#edit').serializeObject()); 
                app.update(data);
                $.mobile.changePage( $("#PageSites"), {
                    transition: "slide",
                    reverse: true,
                    changeHash: true,
                });                
            }
        });
        $(document).on('click', '.delete', function(event) {
            console.log("DEBUG - Trying to delete after delete btn press");
            var data = JSON.stringify($('#edit').serializeObject()); 
            app.delete(data);
        });
        $(document).on('click', '.pictureimg', function(event) {
            console.log("DEBUG - Trying to change picture");
            app.getNewPicture();
        });
        $(document).on('change','.picturefile', function(event){
            app.getNewDesktopPicture(this);
        });        
        
        $(document).on('click', '.mark-completed', function(event) {
            console.log("DEBUG - Mark completed pressed");
            app.markCompleted($(this).data('mark-id'));
        });

        $(document).on('click', '.mark-outstanding', function(event) {
            console.log("DEBUG - Mark outstanding pressed");
            app.markOutstanding($(this).data('mark-id'));
        });
        $(document).on("pagebeforehide","#PageSite",function(){ // When leaving pagetwo
            //reset form data
            $('#edit').find('input[name="id"]').val(0);
            $('#edit').find('input[name="title"]').val("");
            $('#edit').find('input[name="title"]').attr('data-id',0);
            $('#edit').find('textarea[name="description"]').val("");
            $('#edit').find('input[name="picture"]').val("");
            $('#sitepicture').find('img[name="pictureimg"]').attr('src',"");            
        });
    }

};

app.initialize();