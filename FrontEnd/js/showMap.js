var geocoder;
var map;

var markerOffset  = 0.00100;
var actualMarkers = [];
var shiftedMarkers = [];
var displayActual = false;
var displayTracks = false;
var actualPaths = [];
var shiftedPaths = [];

var data = [];

function getData() {
  /*  var datefrom = new Date(document.getElementById("datetimepickerfrom").value);
    var dateto = new Date(document.getElementById("datetimepickerto").value);

    // Javascript format to SQL format
    dateto = dateto.toISOString().slice(0, 19).replace('T', ' ');
    datefrom = datefrom.toISOString().slice(0, 19).replace('T', ' ');

    console.log(datefrom);
    console.log(dateto)

    $.getJSON(
        'http://localhost:3000/getTravelData',
        function (d) {
            console.log(d);
            data = [...d];
            console.log(data);
            initialize();
        })
    */
   
    // Added by Sameer

    var datefrom = new Date(document.getElementById("datetimepickerfrom").value);
    var dateto = new Date(document.getElementById("datetimepickerto").value);

    // console.log(datefrom);
    // console.log(dateto);
    var tomin = dateto.getMinutes();
    var frommin = datefrom.getMinutes();
    var timeTo ;
    var timeFrom;

    if(tomin ==0)
        timeTo = dateto.getHours() +":0"+ dateto.getMinutes();
    else
        timeTo = dateto.getHours() +":"+ dateto.getMinutes();
    
    if(frommin==0)
         timeFrom = datefrom.getHours() +":0"+datefrom.getMinutes();
    else
         timeFrom = datefrom.getHours() +":"+datefrom.getMinutes();
    
    // Javascript format to SQL format
    dateto = dateto.toISOString().slice(0, 10) + " " + timeTo;
    datefrom = datefrom.toISOString().slice(0, 10)+" "+timeFrom;

    console.log(datefrom);
    console.log(dateto);

    let postdata = {
        startdate : datefrom,
            enddate : dateto
    };

    $.ajax({
        url: 'http://localhost:3000/getTravelData',
        type: 'POST',
        data:  postdata,
        success: function (d) {
            
            if (d == false) {
                console.log(d);
                alert("Invalid DATA")
            }
            else {
                console.log(d);
                data = [...d];
                console.log(data);
                initialize();
            }
        }
    });
}
function initialize() {

    map = new google.maps.Map(
        document.getElementById("map_canvas"), {
        center: new google.maps.LatLng(14.581383, 75.634712),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });


    //karnataka boundary
    var src = 'https://www.dropbox.com/s/6ydemc0pydbmgr0/karnaraka.kml?dl=1';
    var kmlLayer = new google.maps.KmlLayer(src, {
        suppressInfoWindows: true,
        preserveViewport: false,
        map: map
    });



    // Setting Marker and info Window
    for (var i = 0; i < data.length; i++) {

        var p = data[i];
        /*var marker = new google.maps.Marker({
            position: { lat: p.Latitude, lng: p.Longitude },
            map: map,
            icon: { 
                //url: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle.png",
                url: "http://maps.gstatic.com/mapfiles/markers2/measle_blue.png",
                size: new google.maps.Size(9, 9),
                anchor: new google.maps.Point(3.5, 3.5)
            }

        });*/
        
        var actualMarker = addMarker(p.Latitude,p.Longitude,map);
        var shiftedMarker = addMarker(p.Latitude+markerOffset,p.Longitude+markerOffset,map);
        
        var content = "<b>ID: </b> " + p.PersonID + "<br>" +
            "<b>Location: </b>" + p.Location + "<br>" +
            "<b>From: </b>" + p.From_Time + "<br>" +
            "<b>To: </b>" + p.To_Time + "<br>" +
            "<b>Address: </b>" + p.Address

        var infowindow = new google.maps.InfoWindow()

        google.maps.event.addListener(actualMarker, 'click', (function (actualMarker, content, infowindow) {
            return function () {
                infowindow.setContent(content);
                infowindow.open(map, actualMarker);
            };
        })(actualMarker, content, infowindow));

        google.maps.event.addListener(shiftedMarker, 'click', (function (shiftedMarker, content, infowindow) {
            return function () {
                infowindow.setContent(content);
                infowindow.open(map, shiftedMarker);
            };
        })(shiftedMarker, content, infowindow));
        
        actualMarkers.push(actualMarker);
        shiftedMarkers.push(shiftedMarker);
    }
    pathInit();
    resolveMarkerDisplay();
}

//google.maps.event.addDomListener(window, "load", initialize);

/* Markers */

function addMarker(latitude,longitude,mapVar){
    return new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapVar,
        icon: { 
            //url: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle.png",
            url: "http://maps.gstatic.com/mapfiles/markers2/measle_blue.png",
            size: new google.maps.Size(9, 9),
            anchor: new google.maps.Point(3.5, 3.5)
        }

    });
}

function resolveMarkerDisplay(){
    console.log("clicked")
    displayActual = !displayActual;
    document.getElementById("dataVar").value = (displayActual)?"Actual Data":"Distorted Data";
    if(displayActual){
        setMarkers(shiftedMarkers,null);
        setMarkers(actualMarkers,map);
        //setPaths(shiftedPaths,null);
        //setPaths(actualPaths,map);
        if(displayTracks)
            plotTracks();
    }
    else{
        setMarkers(actualMarkers,null);
        setMarkers(shiftedMarkers,map);
        //setPaths(shiftedPaths,map);
        //setPaths(actualPaths,null);
        if(displayTracks)
            plotTracks();
    }
}

function setMarkers(markers,mapVar){
    for(var i=0;i<markers.length;i++){
        markers[i].setMap(mapVar);
    }
}

/* Tracks */

function pathInit(){
    //grouping data for line

    let group1 = data.reduce((r, a) => {
        // console.log("a", a);
        // console.log('r', r);
        r[a.PersonID] = [...r[a.PersonID] || [], { 'lat': a.Latitude, 'lng': a.Longitude }]
        return r;
    }, {});

    let group2 = data.reduce((r, a) => {
        // console.log("a", a);
        // console.log('r', r);
        r[a.PersonID] = [...r[a.PersonID] || [], { 'lat': a.Latitude+markerOffset, 'lng': a.Longitude+markerOffset }]
        return r;
    }, {});

   
    keyArray1 = [...Object.keys(group1)];
    keyArray2 = [...Object.keys(group2)];
    console.log(keyArray1);
    //console.log(group.length());
    const colors = ['#FF0000', '#000000'];

    // drawing line along the points
    for (var i = 0; i < Object.keys(group1).length; i++) {  //hardcoded data

        var flightPath1 = addPolyLine(group1[keyArray1[i]],colors[i-1],null);
        var flightPath2 = addPolyLine(group2[keyArray2[i]],colors[i-1],null);

        actualPaths.push(flightPath1);
        shiftedPaths.push(flightPath2);
    }
}  


function addPolyLine(path,color,mapVar){
    var flightPath = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    flightPath.setMap(mapVar);
    return flightPath;
}

function setPaths(paths,mapVar){
    for(var i=0;i<paths.length;i++){
        paths[i].setMap(mapVar);
    }
}

function plotTracks() {
    displayTracks = true;
    if(displayActual){
        setPaths(actualPaths,map);
        setPaths(shiftedPaths,null);
    }
    else{
        setPaths(actualPaths,null);
        setPaths(shiftedPaths,map);
    }
}
