// System variables
var system = require("system");
var fs = require('fs');
// phantom.cookiesEnabled = false;
// phantom.clearCookies();

// Local Varilables
var top_urls = [];
var parsed_urls = {};
var arrayOfUrls = [];
var parse_data_urls = {};
var parsed_top_urls = [];
var u_limit = 0;
var l_limit = 0;
var folder_path = null;
var hostname = "";

RenderUrlsToFile = function(top_urls, callbackPerUrl, callbackFinal) {
    var next, page, retrieve, webpage, parse_data_url_array, path, data_parsed;

    webpage = require("webpage");
    page = null;
    var resources = [];
    nextTopUrl = function(){
    	fs.write(path, "]}", 'a');
    	if (l_limit < u_limit){
    		l_limit++;	
    		initiate();
    	} else {
			return callbackFinal(); 
    	}
    };
    initiate = function(){
    	if (u_limit == 0) {
	    	u_limit = top_urls.length;
	    }
    	urls = [top_urls[l_limit]];
    	hostname = urls[0].replace(/^(https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$))(.*)/i,'$1').replace(/(.*)\//i,'$1');
    	if (folder_path == null){
    		path = 'doctoralia_data_'+urls[0].split("/")[5].split("-")[0]+'.json';
    	} else {
    		path = "./"+folder_path+'/doctoralia_data_'+urls[0].split("/")[5].split("-")[0]+'.json';	
    	}
		console.log(path);
		data_parsed = false;
		fs.write(path, "{\"webData\": [", 'w');
		retrieve();
    }
    next = function(status, url) {
        page.close();
        callbackPerUrl(status, url);
        return retrieve();
    };
    nextData = function(status, url) {
        page.close();
        callbackPerUrl(status, url);
        return retrieveData();
    };
    retrieveData = function(){
    	if(parse_data_url_array.length > 0){
    		url = parse_data_url_array.shift();
    		page = webpage.create();
	        page.onResourceRequested = function(requestData, request) {
	            // console.log('~~~loading~~~', requestData['url']);  // this does get logged now
	            if ((/http.*(antisc|google*).*/gi).test(requestData['url'])) {
			        console.log('The url of the request is matching. Aborting: ' + requestData['url']);
			        request.abort();
			    }
	            resources[requestData.id] = requestData.stage;
	        };
	        // page.onResourceReceived = function(response) {
	        // 	console.log('~~~response~~~', response.stage);  // this does get logged now
	        //     resources[response.id] = response.stage;
	        // };
	        console.log("dataUrl: "+url);
			return page.open(url, function (status) {
				if (status == "success"){
					page.injectJs('jquery.js');
					var click_count = 0;
					var cur_value = 0;
					var max_wait_count = 0;

					function mouseclick( element ) {
					    // create a mouse click event
					    var event = document.createEvent( 'MouseEvents' );
					    event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
					 
					    // send click to element
					    element.dispatchEvent( event );
					}

					function handle_page( page ) {
						var phone_max = page.evaluate(function(){
							pmax = $(".location .viewnumber").length;
							return pmax;
						});
						console.log("phone_max: "+phone_max);

						// var offsets = page.evaluate(function(){
						// 	var offsets = [];
						// 	$("#locationMap .viewnumber").each(function(){offsets.push($(this).offset());});
						// 	return offsets;
						// });

						// for (var i = 0; i < offsets.length; i++) {
						// 	var offset = offsets[i];
						// 	console.log(JSON.stringify(offset));
						// 	page.sendEvent('click', offset.left + 1, offset.top + 1);
						// };

						init_click(page, 0);

					    get_all_phone_numbers(page, phone_max);	   
					    // handle_click_reaction( page )
					}

					function init_click(page, count){
						console.log("Event Called");
						var x = page.evaluate(function(count){
							$("#locationMap .viewnumber:eq("+count+")").each(
								function(){
									var el = this;
								    var ev = document.createEvent("MouseEvent");
								    ev.initMouseEvent(
								        "click",
								        true, true,
								        window, null,
								        0, 0, 0, 0,
								        false, false, false, false,
								        0, null
								    );
								    el.dispatchEvent(ev);
								}
							);
							return $("#locationMap .viewnumber:eq("+count+")").text();
						}, count);
						console.log(x);
					}

					function get_all_phone_numbers(page, phone_max){
						max_wait_count++;
						var cur_value = page.evaluate(function(){
							return $("#phone-modal-content").children().length;
						});
						if (cur_value >= phone_max || max_wait_count > ( phone_max + 2)){
							handle_click_reaction( page );
						} else {
							if (click_count < phone_max){
								init_click(page, click_count++);
							}
							window.setTimeout(
						        function () {
						            get_all_phone_numbers(page, phone_max);
						        },
						        8000 // give page 8 seconds to process click
						    );
						}	
					}

					function get_current_phone_numbers(page){
						var cur_val = page.evaluate(function(){
							return $("#phone-modal-content").children().length;
						});
						return cur_val;
					}
					
					function handle_click_reaction(page){
						data = page.evaluate(function(){
							if ($(".title h1 a").text() != ""){
								// Profile picture
								var pic = $("figure.photo img").attr("src");

								// Doctor name and salutation
								var dname = $(".title h1 a").text().split(". ");
								var doc_name, doc_salutation;
								if (dname.length > 1){
									doc_name = dname[1];
									doc_salutation = dname[0];
								} else {
									doc_name = dname[0];
									doc_salutation = "";
								}
								
								// Doctor Speciality & Subspeciality 
								var speciality = $("#doctorSpecialities p:not(.subspecialities)").text();
								var subspecialities;
								var sub_spec = $("#doctorSpecialities p.subspecialities").text().split(": ");
								if (sub_spec.length > 1){
									subspecialities = sub_spec[1];
								} else {
									subspecialities = sub_spec[0];
								}
								

								// $(".location .viewnumber").click();
								max = $("#locationMap div.location").length;
								var address_data = {};
								for(dt = 1; dt <= max; dt++){
									var location_name = $("#locationMap div.location:eq("+(dt - 1)+") article h3").text().trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2');
									var phoneList = $("#phone-modal-content .phone-modal-content:nth-child("+dt+") .phoneList .phone").map(function(){return $(this).text();}).get().join(", ").trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2');
									// var address = $("#phone-modal-content .phone-modal-content:nth-child("+dt+") .address").map(function(){return $(this).text();}).get().join(",").trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2');
									
									// Address of Clinic
									var street = $("#locationMap div.location:eq("+(dt - 1)+") .address .street").text().trim();
									var loc = $("#locationMap div.location:eq("+(dt - 1)+") .address .location").text().trim();
									var locality = loc.replace(/([0-9]*-[0-9]*|[0-9]*)\s.*/, '$1');
									var lat = $("#locationMap div.location:eq("+(dt - 1)+") .address .more").data("lat");
									var lng = $("#locationMap div.location:eq("+(dt - 1)+") .address .more").data("lng");
									var address = {
										"street": street,
										"location": loc,
										"locality": locality,
										"lat": lat,
										"lng": lng
									}

									// Clinic working hours
									var working_hours = $("#locationMap div.location:eq("+(dt - 1)+") aside p.openinghours").text().replace(/(.*:\s)(.*)/g, "$2").trim();

									// Insurance
									var insurances = $("#locationMap div.location:eq("+(dt - 1)+") aside p.insurances").text().replace(/(.*:\s)(.*)/g, "$2");

									// Misc
									var misc = $("#locationMap div.location:eq("+(dt - 1)+") aside p:not(.insurances):not(.openinghours)").text().trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2')
									
									address_data[dt] = { 
										"name":location_name,
										"phone":phoneList,
										"address":address,
										"working_hours":working_hours,
										"insurances":insurances,
										"misc":misc
									};
								}
								var website = $("section.website a").attr("href");
								
								// Services & facilities
								var services = $("#servicesExpandable #servicesList .name").map(function(){return $(this).text()}).get().join(", ");
								if (services == ""){
									// Facilities
									services = $("section.expertise li:nth-child(1) ul.blt a").map(function(){return $(this).text()}).get().join(", ");
								}

								// Experience in curing diseases 
								var experience = $("section.expertise li:nth-child(2) ul.blt a").map(function(){return $(this).text()}).get().join(", ");

								var education = {};
								var edu_cnt = $("section.education ul li").length;
								for(edu = 0; edu < edu_cnt; edu++){
									var education_dom = $("section.education ul li:eq("+edu+")");
									var edu_array = education_dom.children().map(function(){return $(this).text().trim();}).get();
									education[edu+1] = {
										"degree": education_dom.clone().children().remove().end().text(),
										"institute": edu_array[0],
										"year": edu_array[1]
									};
								}
								// var education = $("section.education ul li").map(function(){return $(this).text()}).get().join(", ");

								// Doctor Registration Number
								var reg_num = $("section.history p.regnum").text().replace(/.*\s([0-9]*).*/,'$1');
								// var career = $("section.history p").map(function(){return $(this).text()}).get().join(", ").trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2');
								return {
									"name": doc_name,
									"salutation": doc_salutation,
									"speciality": speciality,
									"subspecialities": subspecialities,
									"address": address_data,
									"website": website,
									"services": services,
									"experience": experience,
									"education": education,
									"registration_number": reg_num,
									"picture": pic
								};
							} else {
								return "";
							}
						});
						
						if (data == "" || data == null || data == undefined){
							// Antiscraper handeling
							parse_data_url_array.push(url);
							console.log("Antiscraper handeling");
						} else {
							if (data_parsed){
								op_data = ",";
							} else {
								op_data = "";
								data_parsed = true;
							}
							op_data += '{"url":"'+url+'"';
								op_data += ",\"doctor\": "+ JSON.stringify(data);
								// op_data += ",\"misc_data\": ["+JSON.stringify(misc_data) + "]";
							op_data += '}';
					        fs.write(path, op_data, 'a');
						}
				        return nextData(status, url);
					}
					handle_page(page);
				} else {
					parse_data_url_array.push(url);
					return nextData(status, url);
				}
			});
    	} else {
    		return next("success", "success");
    	}
    };
    retrieve = function() {
    	var url;
    	parse_data_url_array = [];
        if (urls.length > 0) {
            url = urls.shift();
            // return if url is already parsed
            if(parsed_urls[url] != undefined){
            	return next("already parsed", url);
            }
			page = webpage.create();
	        page.viewportSize = {
	            width: 800,
	            height: 600
	        };    
	        page.onResourceRequested = function(requestData, request) {
	            console.log('::loading', requestData['url']);  // this does get logged now
	            resources[requestData.id] = requestData.stage;
	            if ((/http.*(antisc|google*).*/gi).test(requestData['url'])) {
			        console.log('The url of the request is matching. Aborting: ' + requestData['url']);
			        request.abort();
			    }
	        };
	        page.onResourceReceived = function(response) {
	            resources[response.id] = response.stage;
	        };
	        console.log("url: "+url);
			return page.open(url, function (status) {
				if (status == "success"){
					page.injectJs('jquery.js');
					var pagination_count = page.evaluate(function(){
						return $("ul.paging a").length;
					});
					var loops = page.evaluate(function(){
			        	return $("ul.paging a").map(function(){
			        		var regex = /^\/medicos(.*)(\/\d+|-\d+-\d+)$/;
			        		if ($(this).attr("href") != undefined && $(this).attr("href") != null && regex.exec($(this).attr("href"))){
			        			return $(this).attr("href");
			        		}
						}).get().join(",");
			        });
			        if (loops == "" && pagination_count != 0){
			        	// parsed_urls[url] = "blocked loops";
			        	urls.push(url);
			        	phantom.clearCookies();
						return next("blocked loops", url);
			        } 
			        loops.split(",").forEach(function(url){
			        	if (parsed_urls[url] == undefined && url != ""){
			        		urls.push(hostname+url);
			        	}
			        });
			        var no_results = page.evaluate(function(){
			        	return $(".no-results-found").text();
			        });
			        var data_paths = page.evaluate(function(){
			        	return $("a").map(function(){
			        		var regex = /^\/medico\/(.*)-\d+$/;
			        		if ($(this).attr("href") != undefined && $(this).attr("href") != null && regex.exec($(this).attr("href"))){
			        			return $(this).attr("href");
			        		}
						}).get().join(",");
			        });
			        console.log("data_paths: "+data_paths);
			        if (data_paths == "" && no_results == ""){
			        	// parsed_urls[url] = "blocked data paths";
			        	urls.push(url);
			        	phantom.clearCookies();
						return next("blocked data paths", url);
			        } 
			        data_paths.split(",").forEach(function(url){
			        	if (parse_data_urls[url] == undefined && url != ""){
			        		parse_data_urls[url] = 1;
			        		parse_data_url_array.push(hostname+url);
			        	} else if(url == ""){
			        		// Do nothing
			        	} else {
			        		parse_data_urls[url] += 1
			        	}
			        });
					parsed_urls[url] = "success";
					return nextData(status, url);
				} else {
					// parsed_urls[url] = "failure";
					urls.push(url);
					return next(status, url);
				} 
			});
		} else {
			console.log("Completed path: "+ path);
			// return callbackFinal(); 
			return nextTopUrl();
		}
	}
	return initiate();
}

if (system.args.length <= 1) {
    console.log("Usage: readFile.txt FILE");
    phantom.exit(1);
} else {
	var file_ext = system.args[1].trim().split(".");
	if (file_ext[file_ext.length - 1] != "txt"){
		console.log("Invalid File Extention: use .txt");
    	phantom.exit(1);
	}
	folder_path = file_ext[0];
}

if (system.args.length > 2) {
    l_limit = parseInt(system.args[2]);
    //u_limit = parseInt(system.args[3]);
}

var content = '', f = null, lines = null;
// var eol = system.os.name == 'windows' ? "\r\n" : "\n";
var eol = ",";
try {
    f = fs.open(system.args[1], "r");
    content = f.read();
} catch (e) {
    console.log(e);
    phantom.exit(1);
}

if (f) {
    f.close();
}

if (content) {
    lines = content.split(eol);
    for (var i = 0, len = lines.length; i < len; i++) {
    	var link = lines[i].trim().replace(/^[\"|\'](.*)[\"|\']$/g, "$1");
    	top_urls.push(link);
    }
}

if(fs.isDirectory(folder_path)){
    // Do something
    console.log("Destination Folder already exist: '"+folder_path+"'. Change the name of the source file: "+system.args[1]);
    phantom.exit(1);
} else {
	console.log("Creating new Folder");
	if(fs.makeDirectory(folder_path)){
		console.log('"'+folder_path+'" is created.');
	} else {
		console.log('"'+folder_path+'" is NOT created.');
		phantom.exit(1);
	}
}

console.log(top_urls);

RenderUrlsToFile(top_urls, (function(status, url) {
    if (status != "success") {
        return console.log(status + ":: '" + url + "'");
    } else {
        return console.log(status + ":: '" + url + "'");
    }
}), function() {
    return phantom.exit();
});

