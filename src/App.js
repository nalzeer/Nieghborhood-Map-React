import React, { Component } from 'react'
import './App.css'
import scriptLoader from 'react-async-script-loader'
import escapeRegExp from 'escape-string-regexp'
import $ from 'jquery'


let markers = []
let infoWindows = []
let contentWindow = ""
// let venueresult = []

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      locations: [{title: 'AcroSports', phone:'(415) 665-2276', location: {lat: 37.7658835,lng:-122.455487}},
        {title: 'House of Air', phone:'(415) 345-9675', location: {lat:37.8047921,lng:-122.4687938}},
        {title: 'My Gym', phone:'(415) 643-5500', location: {lat:37.7594309,lng:-122.3900145}},
        {title: 'Fitness SF', phone:'(415) 348-6377', location: {lat:37.7695915,lng:-122.4069949}},
        {title: 'Recess', phone:'(415) 701-7529',location: {lat:37.7625962,lng:-122.4006064}},
        {title: 'Ms Marians Dance Garden', phone:'(415) 377-2351', location: {lat:37.779935,lng:-122.482164}}],
      map: {},
      query: '',
      requestWasSuccessful: true,
      venues: []
    }
  }

  //updating the query for filtering the locations when user enter location
  updatequery =(query) => {
    this.setState({query: query.trim()})
  }
 // react.componant
  componentWillReceiveProps({isScriptLoadSucceed}){
    if (isScriptLoadSucceed) {
      //Constructor creates a new map
      const map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        //initial point of location
        center: new window.google.maps.LatLng(37.7749295,-122.4194155)
      })
      this.setState({map})
    }
    else {
      //Handling map loading error
      console.log("!!!CAN NOT LOAD GOOGLE MAP!!!")
      this.setState({requestWasSuccessful: false})
    }
  }
  // mounting (react.componant)
  componentDidMount(){
    const that = this
    //Fetching the locations from foursquare API
    this.state.locations.map((location,index)=>{
      const clientId = "B4K4J1H0FEKCQHOWJPVSURVTRXJCSWPUSX0LK1LZR04JYC54"
      const clientSecret = "EHTWPDM13SLQFQ3YXQ0HG2TRLAUWUSYECG5CVRRZ3MS3DJXD"
      const url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + location.location.lat + "," + location.location.lng + "&limit=1"
      return $.ajax({
        url: url,
        dataType: "json",
        success: function(data){
          const valvenues = data.response.venues
          $.each(valvenues, function(i,venue){
            that.setState({venues: venue})
            console.log(venue)
            return contentWindow = `<div class="infoWindow">
                <h4>${venue.name}</h4>
                <p>${location.phone}</p>
                <p>${venue.location.formattedAddress}</p>
                </div>`
          })
          // venueresult = Object.keys(valvenues).map(function(key) {
          //      return [valvenues[key]]
          //    })
        },
        error: function(data){
          console.error(data)
        }
      })
    })
  }
  //updating (react.componant)
  componentDidUpdate(){
    //search query from: https://github.com/udacity/reactnd-contacts-complete/blob/master/src/ListContacts.js
    const {locations, query, map} = this.state
    let showingLocations = locations
    if (query){
      const match = new RegExp(escapeRegExp(query),"i")
      showingLocations = locations.filter((location)=> match.test(location.title))
    }
    else {
      showingLocations = locations
    }
    markers.forEach(mark => { mark.setMap(null) })
    // Make the markers and the infoWindows empty
    markers = []
    infoWindows = []

    showingLocations.forEach((marker,index)=> {
      //Creat InfoWindow object, then add the contentWindow to it
      let LargeInfoWindow = new window.google.maps.InfoWindow({
        content: contentWindow
      })
      //Create the marker
      let locMarker = new window.google.maps.Marker({
        map: map,
        position: marker.location,
        name : marker.title,
        animation: window.google.maps.Animation.DROP
      })
      //Creat Bounds object
      let bounds = new window.google.maps.LatLngBounds()

      // tracking markers and infoWindow
      markers.push(locMarker)
      infoWindows.push(LargeInfoWindow)

      locMarker.addListener("click", function() {
          //Close the infoWindow, when open another infoWindow
          infoWindows.forEach(info => { info.close() })
          //Open the InfoWindow function
          LargeInfoWindow.open(map, locMarker)
          if (locMarker.getAnimation() !== null) {
            locMarker.setAnimation(null)
          } else {
            //Make animation when the marker clicked
          locMarker.setAnimation(window.google.maps.Animation.BOUNCE)
            setTimeout(() => {locMarker.setAnimation(null)}, 400)
          }
      })
      // close infoWindow when user clicked on the map
      window.google.maps.event.addListener(map, "click", function() {
        infoWindows.forEach(info => { info.close() })
      })

      //Extending map marker
      markers.forEach((mark)=>
      bounds.extend(mark.position))
      map.fitBounds(bounds)
    })
  }

  //when the user clicked to the listed location trigger the marker
  locationItem = (itemloc, event) => {
    let selectedItem = markers.filter((currentlocation)=> currentlocation.name === itemloc.title)
    window.google.maps.event.trigger(selectedItem[0], "click")

  }

 render() {
  const {locations, query} = this.state
      //search query from: https://github.com/udacity/reactnd-contacts-complete/blob/master/src/ListContacts.js
    let showingLocations
    if (query){
      const match = new RegExp(escapeRegExp(query),"i")
      showingLocations = locations.filter((location)=> match.test(location.title))
    }
    else{
      showingLocations = locations
    }

    return (
        <div role="main">
          <nav className="nav">
            <span id="subject"> Kids Gymnastics</span>
          </nav>
          <div id="container">
            <div id="map-container" role="application" tabIndex="-1">
              <div id="map" role="region" aria-label="Philadelphia Neighborhood"></div>
            </div>
            <div className="listView">
              <input id="FilteringText" className="search-locations" type="text" placeholder="Search Gym" value={query} onChange={(event)=> this.updatequery(event.target.value)} role="search"/>
              <ul className="location-list">
                {showingLocations.map((locationI, index)=>
                  <li key={index} onClick={this.locationItem.bind(this,locationI)}>{locationI.title}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )
    }
  }
  export default scriptLoader(
    [`https://maps.googleapis.com/maps/api/js?key=AIzaSyBtw340dn7gcAc1VfQuYC-dOAr6AyDgvk8&v=3.exp&libraries=places`]
    )(App)
