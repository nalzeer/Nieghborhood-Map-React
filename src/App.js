import React, { Component } from 'react'
import './App.css'
import scriptLoader from 'react-async-script-loader'
import escapeRegExp from 'escape-string-regexp'
import $ from 'jquery'


let markers = []
let infoWindows = []
// let contentWindow = ""

class App extends Component {
  constructor(props) {
    super(props);
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

  updateData = (arr) => {
      this.setState({venues: arr})
    }

  componentWillReceiveProps({isScriptLoadSucceed}){
    if (isScriptLoadSucceed) {
      //Constructor creates a new map
      const map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        //initial point of location
        center: new window.google.maps.LatLng(37.7749295,-122.4194155)
      });
      this.setState({map});
    }
    else {
      //Handling map loading error
      console.log("!!!CAN NOT LOAD GOOGLE MAP!!!");
      this.setState({requestWasSuccessful: false})
    }
  }

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
          let valvenue = [...data.response.venues]
          const arr = Object.keys(valvenue).map(function (key) { return valvenue[key] })
          that.updateData(arr)
          console.log(typeof arr)
        },
        error: function(data){
          console.error(data)
        }
      })
    })
  }

  componentDidUpdate(){
    //search query from: https://github.com/udacity/reactnd-contacts-complete/blob/master/src/ListContacts.js
    const {locations, query, map} = this.state
    let{venues} = this.state
    let showingLocations = locations
    if (query){
      const match = new RegExp(escapeRegExp(query),'i')
      showingLocations = locations.filter((location)=> match.test(location.title))
    }
    else{
      showingLocations=locations
    }
    markers.forEach(mark => { mark.setMap(null) })
    // Make the markers and the infoWindows empty
    markers = []
    infoWindows = []
    console.log(venues)
    console.log(typeof venues)
    showingLocations.forEach((marker,index)=> {
      // let moreInfo = this.state.venues.filter((more) => marker.title === more[0].name)
      // console.log("data "+ moreInfo)
      let contentWindow = `<div class="infoWindow">
      <h4>${venues.name}</h4>
      <p>${venues.location}</p>
      </div>`

      //Creat a new InfoWindow, then add the contentWindow to it
      let LargeInfoWindow = new window.google.maps.InfoWindow({
        content: contentWindow
      })
      //Extend the map bound
      let bounds = new window.google.maps.LatLngBounds()
      //Create the marker
      let locMarker = new window.google.maps.Marker({
        map: map,
        position: marker.location,
        animation: window.google.maps.Animation.DROP,
        name : marker.title
      })
      //Add the marker to the list of marker
      markers.push(locMarker)
      infoWindows.push(LargeInfoWindow)
      locMarker.addListener('click', function() {
          //Close windows before open the another
          infoWindows.forEach(info => { info.close() })
          LargeInfoWindow.open(map, locMarker)
          //Clear he animaiton before add the new one
          if (locMarker.getAnimation() !== null) {
            locMarker.setAnimation(null);
          } else {
            //Add the aniamtion when the marker is clicked
          locMarker.setAnimation(window.google.maps.Animation.BOUNCE)
            setTimeout(() => {locMarker.setAnimation(null);}, 400)
          }
        })
      //Bounds
      markers.forEach((mark)=>
      bounds.extend(mark.position))
      map.fitBounds(bounds)
    })
  }

  //Trigger a specific marker when the list item is clicked
  locationItem = (item, event) => {
    let selectedItem = markers.filter((currentlocation)=> currentlocation.name === item.title)
    window.google.maps.event.trigger(selectedItem[0], "click");

  }

 render() {
  const {locations, query, requestWasSuccessful} = this.state;
      //search query from: https://github.com/udacity/reactnd-contacts-complete/blob/master/src/ListContacts.js
    let showingLocations
    if (query){
      const match = new RegExp(escapeRegExp(query),"i")
      showingLocations = locations.filter((location)=> match.test(location.title))
    }
    else{
      showingLocations=locations
    }

    return (
      //If the request was successful and the map is there, render the elements
      requestWasSuccessful ? (
        <div>
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
      ) : (
      <div>
        <h1>CAN NOT LOAD GOOGLE MAP</h1>
      </div>
      )
      )
    }
  }
  export default scriptLoader(
    [`https://maps.googleapis.com/maps/api/js?key=AIzaSyBtw340dn7gcAc1VfQuYC-dOAr6AyDgvk8&v=3.exp&libraries=geometry,drawing,places`]
    )(App)
