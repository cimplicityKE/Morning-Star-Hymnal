var db;
	function onDeviceReady(){
		db = openDatabase("sikika_service", "1.0", "Sikika Catholic hymnal", 2*1024*1024);
		db.transaction(createDB, errorCB, successCB);
	}
	
	function createDB(tx){
		//tx.executeSql('DROP TABLE IF EXISTS service');
		tx.executeSql('CREATE TABLE IF NOT EXISTS service(service_title)');
		console.log("Created table if doesn't exist successful!");
		
	}
	
	function errorCB(err){
		console.log("Service table not created!");
	}
	
	function successCB(){
		console.log("Service table!");
	}
	
	function insertDB(tx){
		var _service_title = z;
		var sql = 'INSERT INTO service (service_title) VALUES (?)';
		tx.executeSql(sql,[_service_title], successQueryDB, errorCB);
		console.log("Insert into service successful");
	}
	
	function successQueryDB(tx){
		tx.executeSql('SELECT * FROM service', [], renderList, errorCB);
		console.log("Select from service successful!");
	}
	
	function renderList(tx, results){
		var htmlstring = '';
		
		var len = results.row.length;
		for (var i=0; i<len; i++){
			htmlstring +="<li><a>" + results.rows.item(i).service_title + "</a><li/>";
		}
		
		$('#service_body').html(htmlstring);
		$('#service_body').listview('refresh');
		console.log("Display service successful!");
	}
	/*function submitForm(){
		db.transaction(insertDB, errorCB);
		return false;
	}*/
	console.log("Successful service display!");