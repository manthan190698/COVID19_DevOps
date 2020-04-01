var geocoder;
var map;

var data = [];

function getData() {
    var datefrom = new Date(document.getElementById("datetimepickerfrom").value);
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
}
function initialize() {

    var map = new google.maps.Map(
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

    //grouping data for line
    let group = data.reduce((r, a) => {
        // console.log("a", a);
        // console.log('r', r);
        r[a.PersonID] = [...r[a.PersonID] || [], { 'lat': a.Latitude, 'lng': a.Longitude }]
        return r;
    }, {});

    console.log(group);
    //console.log(group.length());
    const colors = ['#FF0000', '#000000'];

    // drawing line along the points
    for (var i = 1; i <= Object.keys(group).length; i++) {  //hardcoded data

        var flightPath = new google.maps.Polyline({
            path: group[i],
            geodesic: true,
            strokeColor: colors[i - 1],
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        flightPath.setMap(map);
    }

    // Setting Marker and info Window
    for (var i = 0; i < data.length; i++) {

        var p = data[i];
        var marker = new google.maps.Marker({
            position: { lat: p.Latitude, lng: p.Longitude },
            map: map,
            icon: {
                //url: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle.png",
                url: "http://maps.gstatic.com/mapfiles/markers2/measle_blue.png",
                size: new google.maps.Size(9, 9),
                anchor: new google.maps.Point(3.5, 3.5)
            }

        });

        // Id: 1
        //         Person_Id: 1
        //         Location: "Banglore airport"
        //         Latitude: 13.198812
        //         Longitude: 77.707322
        //         FromDate: "2020-02-11 12:20:00"
        //         ToDate: "2020-02-11 12:20:00"
        //         FirstName: "Mahesh"
        //         LastName: "Mishra"
        //         Address: "Electonic City"
        //         City: "Bangalore"

        var content = "<b>Name: </b> " + p.PersonName + "<br>" +
            "<b>Location: </b>" + p.Location + "<br>" +
            "<b>From: </b>" + p.From_Time + "<br>" +
            "<b>To: </b>" + p.To_Time + "<br>" +
            "<b>Address: </b>" + p.Address

        var infowindow = new google.maps.InfoWindow()

        google.maps.event.addListener(marker, 'click', (function (marker, content, infowindow) {
            return function () {
                infowindow.setContent(content);
                infowindow.open(map, marker);
            };
        })(marker, content, infowindow));
    }


}

//google.maps.event.addDomListener(window, "load", initialize);

