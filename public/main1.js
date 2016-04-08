
function countryUpdate(country){
	$('.ind').hide();
	$('.usa').hide();
	$('.aus').hide();
	$('.wor').hide();
	if(country == 'ind'){
		$('.ind').show();
	}
	if(country == 'wor'){
		$('.wor').show();
	}
	if(country == 'us'){
		$('.usa').show();
	}
	if(country == 'aus'){
		$('.aus').show();
	}
}
function getIconURL(code) {
	return "images/weathericons/icon" + code + ".png";
}

function getUnits() {
	return $("#weather_units").val();
}

function getCoordinates() {
	return document.getElementById("weather_presets").value;
}

function setUnits() {
	setLocation();
}

function getDow(d) {
    var weekNames = [ "Sunday", "Monday", "Tuesday", "Wednedsay", "Thursday", "Friday", "Saturday" ];
    return weekNames[d.getDay()]; 
}

function getMonthDate(d) {
   	var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    return monthNames[d.getMonth()] + ' ' + d.getDate();
}

function parseDate(d) {
    var weekNames = [ "Sunday", "Monday", "Tuesday", "Wednedsay", "Thursday", "Friday", "Saturday" ],
    	monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
        d2 = weekNames[d.getDay()] + ', ' 
        + 	monthNames[d.getMonth()] + ' ' 
        +  	d.getDate() + ', ' 
        +	d.getFullYear() + ' @ ' 
        +	d.getHours() + ':' 
        + 	pad(d.getMinutes(), 2)
    return d2;
}

function getTime(iso) {
	if (iso) {
		return iso.substring(11, 16);
	} else {
		return "unknown";
	}
}

function speedType() {
	var units = $("#weather_units").val();
	if (units == 'm' || units == 'h') {
		return "KPH";
	} else {
		return "MPH";
	}
}

function tempType() {
	var units = $("#weather_units").val();
	if (units == 'm' || units == 'h') {
		return "C";
	} else {
		return "F";
	}
}


function updateToday(forecast) {
	var d = new Date(forecast.fcst_valid_local) || Date.now();
	var dateString =  getMonthDate(d) + ", " + d.getFullYear();
	var data = forecast.day || forecast.night;
	console.log(data);
	$("#weather_icon").html('<img id="weather_icon" hspace="10px" width="70px" height="70px" style="margin-top: -30px" src="' + getIconURL(data.icon_code) + '"/>');
	$("#weather_dow").html(forecast.dow);
	$("#weather_date").html(dateString);
	$("#weather_temp").html(data.temp + '&#176;' + tempType());
	$("#weather_desc").html(data.phrase_32char);
	$("#weather_wind").html(data.wdir_cardinal + ' ' + data.wspd + ' ' + speedType());
	$("#weather_humidity").html(data.rh + '%');
	$("#weather_uv").html(data.uv_index + ' out of 10');
	$("#weather_sunrise").html(getTime(forecast.sunrise));
	$("#weather_sunset").html(getTime(forecast.sunset));
	$("#weather_moonrise").html(getTime(forecast.moonrise));
	$("#weather_moonset").html(getTime(forecast.moonset));

	$("#weather_display").css('display', 'block');
}

function weatherAPI(path, qs, done) {
   	$.ajax({
		url: path,
		type: 'GET',
		contentType:'application/json',
		data: qs,
  		success: function(data) {
  			if (data.message == 401) {
  				try {
  					data.data = JSON.parse(data.data);
  				} catch(e) {
  				}
				done(data);
  			} else {
  				done(null, data);
  			}
		},
		error: function(xhr, textStatus, thrownError) {
			done(textStatus);
		}
	});
}


function renderDailyForecast(forecasts) {
	var s = "";
	forecasts.forEach(function(forecast, index) {
		var icon = (forecast.day || forecast.night).icon_code;
		s += '<div class="col-xs-12" style="color: #fff; margin-top:10px">'
	+		'<div class="col-xs-3" style="background-color: #5599c8; height: 50px; font-size: 22px; padding-top: 8px; font-weight: bold">'
	+			'<center>'
	+				forecast.dow
	+			'</center>'
	+		'</div>'
	+		'<div class="col-xs-9" style="background-color: #000; height: 50px;">'
	+			'<div class="col-xs-2">'
	+				'<img id="weather_icon" width="40px" hspace="10px" height="40px" src="' + getIconURL(icon) + '" style="margin-top: 4px">'
	+			'</div>'
	+			'<div class="col-xs-3" style="padding-top: 8px; font-size: 24px">'
	+				forecast.max_temp + '&#176; / '+forecast.min_temp+ '&#176;'
	+			'</div>'
	+			'<div class="col-xs-7" style="padding-top: 10px">'
	+				forecast.narrative 
	+			'</div>'
	+		'</div>'
	+	'</div>';
	});
	return s;
}
var coord;
function setLocation(geocode, units, language) {
	geocode = geocode || coord;
	units = units || getUnits();
	language = "en";
	coord = geocode;
	weatherAPI("/api/forecast/daily", { 
		geocode: geocode,
		units: units,
		language: language
	}, function(err, data) {
  		if (err) {
  		} else {
  			if (data.forecasts) {
  				updateToday(data.forecasts[0]);
				$("#weather_daily").html(renderDailyForecast(data.forecasts.slice(1)));
			} else {
	  		}
  		}
	});

	// weatherAPI("/api/forecast/hourly", { 
	// 	geocode: geocode,
	// 	units: units,
	// 	language: language
	// }, function(err, data) {
 //  		if (err) {
 // 
 //  		} else {
 //  			if (data.forecasts) {
 // 
 // 
	// 		} else {
	//
	// 		}
 //  		}
	// });
}

function getLocation(done) {
    var x = document.getElementById("mapholder");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
       	    var latitude = position.coords.latitude;
       	    var longitude = position.coords.longitude;
       	    done(null, latitude.toFixed(2) + ',' + longitude.toFixed(2));
        }, function(err) {
		    switch(err.code) {
		        case err.PERMISSION_DENIED:
		            done("User denied the request for Geolocation.");
		            break;
		        case err.POSITION_UNAVAILABLE:
		            done("Location information is unavailable.");
		            break;
		        case err.TIMEOUT:
		            done("The request to get user location timed out.");
		            break;
		        case err.UNKNOWN_ERROR:
		            done("An unknown error occurred.");
		            break;
		    }
        });
    } else {
        done("Geolocation is not supported by this browser.");
    }
}


function init() {
	getLocation(function(err, geocode) {
		if (err) {
			setLocation();
		} else {
			// addGeocode('Local', geocode);
			setLocation(geocode, "m", "en");
		}
	});
}