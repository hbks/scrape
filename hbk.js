var page = require('webpage').create();
var parsed_urls = {};
var arrayOfUrls = [];
var parse_data_urls = {};
var l_limit = 0;
var u_limit = 0;

system = require("system");

RenderUrlsToFile = function(urls, callbackPerUrl, callbackFinal) {
    var next, page, retrieve, urlIndex, webpage, parse_data_url_array;
    var fs = require('fs');
	var path = 'ds_test_'+l_limit+'_'+u_limit+'.json';
	console.log(path);
    urlIndex = 0;
    data_parsed = false;
    webpage = require("webpage");
    page = null;
    var resources = [];
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
	        // page.onResourceRequested = function(requestData, request) {
	        //     console.log('~~~loading~~~', requestData['url']);  // this does get logged now
	        //     resources[requestData.id] = requestData.stage;
	        // };
	        // page.onResourceReceived = function(response) {
	        //     resources[response.id] = response.stage;
	        // };
	        console.log("dataUrl: "+url);
			return page.open(url, function (status) {
				if (status == "success"){
					page.injectJs('jquery.js');

					function mouseclick( element ) {
					    // create a mouse click event
					    var event = document.createEvent( 'MouseEvents' );
					    event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
					 
					    // send click to element
					    element.dispatchEvent( event );
					}

					function handle_page( page ) {
					    page.evaluate(
					        function( mouseclick_fn ) {
					            // var element = document.querySelector( "input#payConf" );
					            // mouseclick_fn( element );
					            $(".location .viewnumber:first").each(function(){mouseclick_fn(this);});
					        },
					        mouseclick
					    );
					 
					    window.setTimeout(
					        function () {
					            handle_click_reaction( page );
					        },
					        5000 // give page 5 seconds to process click
					    );
					}
					
					function handle_click_reaction(page){
						data = page.evaluate(function(){
							var pic = $("figure.photo img").attr("src");
							var doc_name = $(".title h1 a").text();
							var speciality = $("#doctorSpecialities p:not(.subspecialities)").text();
							var subspecialities = $("#doctorSpecialities p.subspecialities").text();
							$(".location .viewnumber").click();
							max = $("#locationMap div.location").length;
							var address_data = [];
							for(dt = 1; dt <= max; dt++){
								var location_name = $("#locationMap div.location:eq("+(dt - 1)+") article h3").text().trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2');
								var phoneList = $("#phone-modal-content .phone-modal-content:nth-child("+dt+") .phoneList").map(function(){return $(this).text();}).get().join(",").trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2');
								// var address = $("#phone-modal-content .phone-modal-content:nth-child("+dt+") .address").map(function(){return $(this).text();}).get().join(",").trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2');
								var address = $("#locationMap div.location:eq("+(dt - 1)+") .address span").text().trim();
								var working_hours = $("#locationMap div.location:eq("+(dt - 1)+") aside p.openinghours").text();
								var insurances = $("#locationMap div.location:eq("+(dt - 1)+") aside p.insurances").text();
								var misc = $("#locationMap div.location:eq("+(dt - 1)+") aside p:not(.insurances):not(.openinghours)").text().trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2')
								address_data.push({ 
									"name":location_name,
									"phone":phoneList,
									"address":address,
									"working_hours":working_hours,
									"insurances":insurances,
									"misc":misc
								});
							}
							var website = $("section.website a").attr("href");
							var services = $("#servicesExpandable #servicesList .name").map(function(){return $(this).text()}).get().join(", ");
							var experience = $("section.expertise li:nth-child(2) ul.blt a").map(function(){return $(this).text()}).get().join(", ");
							var facilities = $("section.expertise li:nth-child(1) ul.blt a").map(function(){return $(this).text()}).get().join(", ");
							var education = $("section.education ul li").map(function(){return $(this).text()}).get().join(", ");
							var career = $("section.history p").map(function(){return $(this).text()}).get().join(", ").trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2');
							return {
								"picture": pic,
								"name": doc_name,
								"speciality": speciality,
								"subspecialities": subspecialities,
								"address": address_data,
								"website": website,
								"services": services,
								"experience": experience,
								"facilities": facilities,
								"education": education,
								"career": career
							};
						});
						// misc_data = page.evaluate(function(){
						// 	var allTags = document.body.getElementsByTagName('*');
						// 	var classNames = {};
						// 	for (var tg = 0; tg< allTags.length; tg++) {
						// 	    var tag = allTags[tg];
						// 	    if (tag.className) {
						// 	      var classes = tag.className.split(" ");
						// 		for (var cn = 0; cn < classes.length; cn++){
						// 		  var cName = classes[cn];
						// 		  if (! classNames[cName]) {
						// 		    classNames[cName] = true;
						// 		  }
						// 		}
						// 	    }   
						// 	}
						// 	var classList = [];
						// 	for (var name in classNames) classList.push(name);
						// 	var data = {}
						// 	for (var cp in classList){ 
						// 		if(classList[cp] != "" && $("."+classList[cp]).get(0)) {
						// 			data[classList[cp]] = $("."+classList[cp]).text().trim().replace(/\r?\n|\r/gm,"").replace(/ +(?= )/g,'').replace(/([a-z])([A-Z])/g, '$1 $2');
						// 		} 
						// 	}
						// 	return data;
						// });
						if (data_parsed){
							op_data = ",";
						} else {
							op_data = "";
							data_parsed = true;
						}
						op_data += '{"url":"'+url+'"';
							op_data += ",\"data\": ["+ JSON.stringify(data)+ "]";
							// op_data += ",\"misc_data\": ["+JSON.stringify(misc_data) + "]";
						op_data += '}';
				        fs.write(path, op_data, 'a');
				        return nextData(status, url);
					}

					handle_page(page);
				} else {
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
            urlIndex++;
			page = webpage.create();
	        page.viewportSize = {
	            width: 800,
	            height: 600
	        };            
	        // page.onResourceRequested = function(requestData, request) {
	        //     console.log('::loading', requestData['url']);  // this does get logged now
	        //     resources[requestData.id] = requestData.stage;
	        // };
	        // page.onResourceReceived = function(response) {
	        //     resources[response.id] = response.stage;
	        // };
	        if (urlIndex == 1){
	        	fs.write(path, "{\"webData\": [", 'w');
	        }
	        console.log("url: "+url);
			return page.open(url, function (status) {
				if (status == "success"){
					page.injectJs('jquery.js');
					var loops = page.evaluate(function(){
			        	return $("ul.paging a").map(function(){
			        		var regex = /^\/medicos(.*)(\/\d+|-\d+-\d+)$/;
			        		if ($(this).attr("href") != undefined && $(this).attr("href") != null && regex.exec($(this).attr("href"))){
			        			return $(this).attr("href");
			        		}
						}).get().join(",");
			        });
			        // loops.split(",").forEach(function(url){
			        // 	if (parsed_urls[url] == undefined){
			        // 		urls.push("http://www.doctoralia.com.br"+url);
			        // 	}
			        // });
			        var data_paths = page.evaluate(function(){
			        	return $("a").map(function(){
			        		var regex = /^\/medico\/(.*)-\d+$/;
			        		if ($(this).attr("href") != undefined && $(this).attr("href") != null && regex.exec($(this).attr("href"))){
			        			return $(this).attr("href");
			        		}
						}).get().join(",");
			        });
			        data_paths.split(",").forEach(function(url){
			        	if (parse_data_urls[url] == undefined){
			        		parse_data_urls[url] = 1;
			        		parse_data_url_array.push("http://www.doctoralia.com.br"+url);
			        	} else {
			        		parse_data_urls[url] += 1
			        	}
			        });
					parsed_urls[url] = "success";
					return nextData(status, url);
				}  else {
					parsed_urls[url] = "failure";
					return next(status, url);
				} 
			});
		} else {
			fs.write(path, "]}", 'a');
			return callbackFinal(); 
		}
	}
	return retrieve();
}
if (system.args.length > 1) {
    l_limit = parseInt(system.args[1]);
    u_limit = parseInt(system.args[2]);
    for (var i = l_limit; i < u_limit; i++) {
    	arrayOfUrls.push("http://www.doctoralia.com.br/medicos/cidade/sao+paulo-116705/"+i);
    };
    for (var i = l_limit - 1; i >= (l_limit - 10); i--) {
    	url = "http://www.doctoralia.com.br/medicos/cidade/sao+paulo-116705/"+i;
    	parsed_urls[url] = "success";
    };
} else {
    arrayOfUrls = ["http://www.doctoralia.com.br/medicos/cidade/sao+paulo-116705/41"];
}

RenderUrlsToFile(arrayOfUrls, (function(status, url) {
    if (status != "success") {
        return console.log(status + ":: '" + url + "'");
    } else {
        return console.log(status + ":: '" + url + "'");
    }
}), function() {
    return phantom.exit();
});
