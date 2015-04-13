var page = require('webpage').create();
var parsed_urls = {};
var arrayOfUrls = [];
var parse_data_urls = {};
var parsed_top_urls = [];
var u_limit = 0;
var l_limit = 0;
// phantom.cookiesEnabled = false;
// phantom.clearCookies();
system = require("system");

RenderUrlsToFile = function(top_urls, callbackPerUrl, callbackFinal) {
    var next, page, retrieve, urlIndex, webpage, parse_data_url_array;
    var fs = require('fs');
    if (u_limit == 0) {
    	u_limit = top_urls.length;
    }
    for (var t_url = l_limit; t_url < u_limit; t_url++) {
    	urls = [top_urls[t_url]];
		var path = 'doctoralia_'+urls[0].split("/")[5].split("-")[0]+'.json';
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
							// Get the avialable phone number count & update global value
							// var cur_val = get_current_phone_numbers(page);
							// console.log("phone actual count: "+cur_val+" :: phone global count: "+cur_value);
							// if (cur_val > cur_value){
							// 	window.setTimeout(function(){
							// 		init_click(page, click_count++);
							// 	},1000);
							// 	cur_value = cur_val;
							// 	if (cur_value >= phone_max){
							// 		handle_click_reaction( page );
							// 	} 
							// }
							// window.setTimeout(
						 //        function () {
						 //            get_all_phone_numbers(page, phone_max);
						 //        },
						 //        5000 // give page 500 ms to process click
						 //    );
							max_wait_count++;
							var cur_value = page.evaluate(function(){
								return $("#phone-modal-content").children().length;
							});
							if (cur_value >= phone_max || max_wait_count > (/* phone_max + */2)){
								handle_click_reaction( page );
							} else {
								if (click_count < phone_max){
									init_click(page, click_count++);
								}
								window.setTimeout(
							        function () {
							            get_all_phone_numbers(page, phone_max);
							        },
							        8000 // give page 500 ms to process click
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
									var edu_array = $("section.education ul li:eq("+edu+")").children().map(function(){return $(this).text().trim();}).get();
									education[edu+1] = {
										"degree": edu_array[0],
										"institute": edu_array[1],
										"year": edu_array[2]
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
							});
							if (data_parsed){
								op_data = ",";
							} else {
								op_data = "";
								data_parsed = true;
							}
							op_data += '{"url":"'+url+'"';
								op_data += ",\"doctor\": ["+ JSON.stringify(data)+ "]";
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
				        if (loops == ""){
				        	parsed_urls[url] = "blocked loops";
				        	urls.push(url);
							return next(status, url);
				        } 
				        loops.split(",").forEach(function(url){
				        	if (parsed_urls[url] == undefined){
				        		urls.push("http://www.doctoralia.com.br"+url);
				        	}
				        });
				        var data_paths = page.evaluate(function(){
				        	return $("a").map(function(){
				        		var regex = /^\/medico\/(.*)-\d+$/;
				        		if ($(this).attr("href") != undefined && $(this).attr("href") != null && regex.exec($(this).attr("href"))){
				        			return $(this).attr("href");
				        		}
							}).get().join(",");
				        });
				        if (data_paths == ""){
				        	parsed_urls[url] = "blocked data paths";
				        	urls.push(url);
							return next(status, url);
				        } 
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
				console.log("Completed path: "+ path);
				// return callbackFinal(); 
			}
		}
		return retrieve();
    };
    return callbackFinal(); 
}

top_urls = ["http://www.doctoralia.com.br/medicos/especialidade/acupunturistas-1309/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/alergistas-1302/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/anátomopatologistas-1298/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/anestesiologistas-1325/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/angiologistas-1311/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cardiologistas-1313/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+buco-maxilo-facial-1866/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+cardiovasculares-1320/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+cranio-maxilo-faciales-1989/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+da+mão-1329/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+de+cabeça+e+pescoço-1326/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+do+aparelho+digestivo-1317/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+gerais-1299/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+pediátricos-1322/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+plásticos-1310/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+torácicos-1321/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/cirurgiões+vasculares-1340/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/coloproctologistas-1304/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/dentistas-1433/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/dermatologistas-1314/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/endocrinologistas-1296/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/endoscopistas-1330/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/enfermeiros-1656/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/especialistas+em+administração+em+saúde-1344/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/especialistas+em+dor-2840/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/especialistas+em+medicina+estetica-1863/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/especialistas+em+medicina+física+e+reabilitação-1292/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/especialistas+em+medicina+nuclear-1337/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/especialistas+em+medicina+preventiva-1347/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/especialistas+em+terapias+complementares+e+alternativas-2185/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/fisioterapeutas-1901/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/fonoaudiólogos-2202/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/gastroenterologistas-1315/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/geneticistas-1332/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/geriatras-1295/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/ginecologistas-1300/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/hematologistas-1333/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/homeopatas-1335/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/infectologistas-1323/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/intensivistas-1338/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/internistas-1655/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/mastologistas-1301/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/médicos+clínicos-1303/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/médicos+de+família-1339/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/médicos+de+tráfego-1345/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/médicos+de+urgencia-1343/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/médicos+do+esporte-1342/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/médicos+do+trabalho-1334/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/médicos+peritos-1346/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/nefrologistas-1324/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/neurocirurgiões-1318/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/neurofisiologistas-2639/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/neurologistas-1297/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/nutricionistas-2203/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/nutrologistas-1331/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/oftalmologistas-1305/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/oncologistas-1328/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/optometristas-1865/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/ortopedistas+-+traumatologistas-1306/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/osteopatas-2839/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/otorrinolaringologistas-1308/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/patologistas+clínicos-1316/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/pediatras-1307/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/pneumologistas-1327/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/podólogos-2699/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/psicanalistas-2789/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/psicólogos-1434/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/psicopedagogos-2797/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/psiquiatras-1312/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/quiropraxistas-2381/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/radiologistas-1294/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/radioterapeutas-1319/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/reumatologistas-1336/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/sexólogos-2819/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/terapeutas+ocupacionais-2799/sao+paulo-116705-1", "http://www.doctoralia.com.br/medicos/especialidade/urologistas-1293/sao+paulo-116705-1"];

if (system.args.length > 1) {
    l_limit = parseInt(system.args[1]);
    u_limit = parseInt(system.args[2]);
}

RenderUrlsToFile(top_urls, (function(status, url) {
    if (status != "success") {
        return console.log(status + ":: '" + url + "'");
    } else {
        return console.log(status + ":: '" + url + "'");
    }
}), function() {
    return phantom.exit();
});



