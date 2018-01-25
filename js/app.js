"use strict";
//global variables
var map;
var infoWindow;
//Foursquare clientid and clientSecret
var clientID = "42ITZKVEY5AIIHWENOHIF1CXCCXYS1VPU4V0VSRWYDTYZNM5";
var clientSecret = "MGNJU45QOQKYTCYVUVQTW5KPGEZEI2BUE4UYZEIRGKJIOHPE";

var Location = function(data) {
    var self = this;

    this.name = data.name;
    this.lat = data.lat;
    this.long = data.long;
    this.URL = "";
    this.street = "";
    this.city = "";
    this.phone = "";

    this.visible = ko.observable(true);

    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

    $.getJSON(foursquareURL).done(function(data) {
        var results = data.response.venues[0];
        self.URL = results.url || "No url found";
        self.street = results.location.formattedAddress[0] || "No address found";
        self.city = results.location.formattedAddress[1] || "No address found";
        self.phone = results.contact.phone || "No phone found";

    }).fail(function() {
        alert("Error found. Unable to load the place.");
    });

    // Marker

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.long),
        map: map,
        title: data.name
    });

    this.showMarker = ko.computed(function () {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    //EventListener
    this.marker.addListener('click', function() {
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
            '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" +
            '<div class="content">' + self.street + "</div>" +
            '<div class="content">' + self.city + "</div>" +
            '<div class="content"><a href="tel:' + self.phone + '">' + self.phone + "</a></div></div>";

        infoWindow.setContent(self.contentString);

        infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2100);
    });

    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};



//-ViewModel
function AppViewModel() {
    var self = this;


    // create array of places

    this.locationList = ko.observableArray([]);
    this.searchLocation = ko.observable('');

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {
            lat: 37.77986,
            lng: -122.429
        }
    });

    infoWindow = new google.maps.InfoWindow({
        content: self.contentString
    });


    initialLocations.forEach(function(locationItem) {
        // To each Location object, pass the same infoWindow object
        self.locationList.push(new Location(locationItem, self.infoWindow));
    });

    this.filteredList = ko.computed(function() {
        var filter = self.searchLocation().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElem = document.getElementById('map');
    this.mapElem.style.height = window.innerHeight - 50;
}

// Bind the VeiewModel to the view using knockout
function startApp() {
    ko.applyBindings(new AppViewModel());
}

function errorHandling() {
    alert("Error loading page, try refresh your page and internet connection.");
}
