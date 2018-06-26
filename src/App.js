import React, { Component } from 'react'
import './App.css'
import scriptLoader from 'react-async-script-loader'
import escapeRegExp from 'escape-string-regexp'
import $ from 'jquery';
window.jQuery = $;
window.$ = $;
global.jQuery = $;

let markers = []
let infoWindows = []

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      locations: [
        {title: 'Acro sports', phone:'(415) 665-2276', location: {lat: 37.7658835,lng:-122.455487}},
        {title: 'American Gymnastics Club', phone:'(415) 731-1400', location: {lat:37.7612837,lng:-122.4892281}},
        {title: 'My Gym', phone:'(415) 643-5500', location: {lat:37.7594309,lng:-122.3900145}},
        {title: 'Head Over Heels Gymnastics', phone:'(510) 655-1265', location: {lat:37.7994784,lng:-122.4108993}},
        {title: 'Recess', phone:'(415) 701-7529',location: {lat:37.7625962,lng:-122.4006064}},
        {title: 'Ms Marians Dance Garden', phone:'(415) 377-2351', location: {lat:37.779935,lng:-122.482164}}
      ],
      map: {},
      query: '',
      requestWasSuccessful: true,
      selectedMarker: '',
      places: []
    }
  }

  updatequery = (query) => {
    this.setState({query: query.trim()})
  }

  // updatePlace = (newPlaces) => {
  //   this.setState({places: newPlaces})
  // }

  componentWillReceiveProps({isScriptLoadSucceed}){
    if (isScriptLoadSucceed) {
      // Creating map object and initiating location for starting
      var map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: new window.google.maps.LatLng(37.7749295,-122.4194155),
      })
      this.setState({map})
    }
    else {
      console.log("ERROR: Could not laod the google map API")
      this.setState({requestWasSuccessful: false})
    }
  }

  componentDidMount() {
    this.state.locations.map((location) => {
      const clientId = "B4K4J1H0FEKCQHOWJPVSURVTRXJCSWPUSX0LK1LZR04JYC54";
      const clientSecret = "EHTWPDM13SLQFQ3YXQ0HG2TRLAUWUSYECG5CVRRZ3MS3DJXD";
      const url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + location.location.lat + "," + location.location.lng + "&limit=1";
      $.ajax({
        url: url,
        dataType: "json",
        success: function(data){
          let newPlaces = data.response.venues[0]
          console.log(newPlaces)
          // this.updatePlace(newPlaces)
        },
        error: function(data){
          console.error(data)
        }
      })
    })
  }

componentDidUpdate() {
  const {locations, query, map} = this.state
  // search query below from Udacity contactsList project
  let showingLocations = locations
  if (query) {
    const match = new RegExp (escapeRegExp(query), 'i')
    showingLocations = locations.filter((location) => match.test(location.title))
  }
  else {
    showingLocations = locations
  }
  markers.forEach(mark => {mark.setMap(null)})
  //Make the markers and infoWindows arrays empty.
  markers = []
  infoWindows = []
  showingLocations.map((marker,index) => {
    let windowcontent =
      `<div class="infoWindow">
          <h4>${marker.title}</h4>
          <p>Adress: ${marker.address}</p>
          <p>Phone: ${marker.phone}</p>
          <a href="">For More Information</a>
       </div>`
    //Creating infoWindow object.
    let largeInfowindow = new window.google.maps.InfoWindow({
      content: windowcontent
    })
    //Creating bounds object.
    let bounds = new window.google.maps.LatLngBounds()
    //Creating marker object.
    let placeMarker = new window.google.maps.Marker({
      map: map,
      position: marker.location,
      animation: window.google.maps.Animation.DROP,
      name: marker.title
    })
    markers.push(placeMarker)
    infoWindows.push(largeInfowindow)
    placeMarker.addListener('click', function() {
      //close windows before open the another
      infoWindows.forEach(windowInfo => {windowInfo.close()})
      largeInfowindow.open(map, placeMarker)
      if (placeMarker.getAnimation() !== null) {
        placeMarker.setAnimation()(null)
      } else {
        placeMarker.setAnimation(window.google.maps.Animation.BOUNCE)
        setTimeout(() => {placeMarker.setAnimation(null)}, 300)
      }
    })
    markers.forEach((mark) =>
    bounds.extend(mark.position))
    map.fitBounds(bounds)
  })
}

locationItem = (item, event) => {
  let choosen = markers.filter((currentplace) => currentplace.name === item.title)
  window.google.maps.event.trigger(choosen[0], 'click')
}
  render() {
    const {locations, query} = this.state
    // search query below from Udacity contactsList project
    let showingLocations
    if (query) {
      const match = new RegExp(escapeRegExp(query),'i')
      showingLocations = locations.filter((location) => match.test(location.title))
    } else {
      showingLocations = locations
    }
    return (
      <div role="main">
        <nav className="nav">
          <span id="subject">Kids Gymnastics Neighborhood</span>
        </nav>
        <div id="container">
          <div id="map-container" role="application">
            <div id="map" role="region"></div>
          </div>
          <div className="listView">
            <input className="search-locations" type="text"
              placeholder="Search for a Gym" value={query}
              onChange={(event) => this.updatequery(event.target.value)} role="search"/>
            <ul className="location-list">
              {showingLocations.map((mylocation, index) =>
                <li key={index} onClick={this.locationItem.bind(this, mylocation)}>{mylocation.title}</li>)}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

export default scriptLoader(
    [`https://maps.googleapis.com/maps/api/js?key=AIzaSyAD4vpwyw4zFgzo_4_RG4lAaVwCIVZM9Jc&libraries=places`]
)(App);
