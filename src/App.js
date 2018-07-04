import React, { Component } from 'react'
import './App.css'
import {allLocations} from './allLocations.js'
import escapeRegExp from 'escape-string-regexp'
import $ from 'jquery'


let markers = []
let infoWindows = []

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      locations: allLocations,
      map: {},
      LargeInfoWindow: {},
      locMarker: {},
      query: ""
    }
    this.initMap = this.initMap.bind(this)
  }

  //updating the query for filtering the locations when user enter location
  updatequery = (query) => {
    this.setState({query: query.trim()})
    infoWindows.forEach(info => { info.close() })
  }

  componentDidMount(){
    window.initMap = this.initMap
    loadMapJS(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyBtw340dn7gcAc1VfQuYC-dOAr6AyDgvk8&v=3.exp&libraries=geometry,places&callback=initMap"
    )
  }

  initMap(){
    const self = this
    //Constructor creates a new map
    const map = new window.google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      //initial point of location
      center: new window.google.maps.LatLng(37.7749295,-122.4194155),
      mapTypeControl: false
    })

    //Creat InfoWindow object, then add the contentWindow to it
    let LargeInfoWindow = new window.google.maps.InfoWindow({})
    // Tracking infoWindow
    infoWindows.push(LargeInfoWindow)

    this.setState({
      map: map,
      LargeInfoWindow: LargeInfoWindow
    })

    //Creat Bounds object
    let bounds = new window.google.maps.LatLngBounds()

    // close infoWindow when user clicked on the map
    window.google.maps.event.addListener(map, "click", function() {
      infoWindows.forEach(info => { info.close() })
    })

    // Clear the markers and the infoWindows arrays
    markers = []
    // infoWindows = []
    this.state.locations.forEach((location,index) => {
      //Create the marker
      let locMarker = new window.google.maps.Marker({
        map: map,
        position: location.location,
        name : location.title,
        animation: window.google.maps.Animation.DROP
      })
      // Tracking markers
      markers.push(locMarker)
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
          self.setState({ locMarker })
          console.log(markers)
          LargeInfoWindow.setContent("Loading Content...")
          self.getMarkerInfo(locMarker)
      })
      //Extending map marker
      markers.forEach((mark) => bounds.extend(mark.position))
      map.fitBounds(bounds)
    })
  }

  getMarkerInfo(locMarker){
    const that = this
    //Fetching the locations from foursquare API
      const clientId = "B4K4J1H0FEKCQHOWJPVSURVTRXJCSWPUSX0LK1LZR04JYC54"
      const clientSecret = "EHTWPDM13SLQFQ3YXQ0HG2TRLAUWUSYECG5CVRRZ3MS3DJXD"
      const url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + locMarker.getPosition().lat() + "," + locMarker.getPosition().lng() + "&limit=1"
      return $.ajax({
        url: url,
        dataType: "json",
        success: function(data){
          const valvenues = data.response.venues[0]
          that.setState(valvenues)
          that.state.LargeInfoWindow.setContent(`<div tabIndex="0" class="infoWindow">
                   <h4>${valvenues.name}</h4>
                   <p>${valvenues.location.formattedAddress}</p>
                   </div>`)
        },
        error: function(data){
          that.state.LargeInfoWindow.setContent(`<div tabIndex="0" class="infoWindow">
                   <h4>ERROR: ${data}</h4>
                   </div>`)
        }
      })
  }

  //when the user clicked to the listed location trigger the marker
  locationItem = (itemloc, event) => {
    let selectedItem = markers.filter((currentlocation)=> currentlocation.name === itemloc.title)
    window.google.maps.event.trigger(selectedItem[0], "click")
  }

  //To support accessibility (https://stackoverflow.com/questions/34223558/enter-key-event-handler-on-react-bootstrap-input-component?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa)
  handleKeyPress(target,item,e) {
    if(item.charCode === 13){
     this.locationItem(target,e)
   }
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
            <span id="subject" tabIndex="0"> Kids Gymnastics</span>
          </nav>
          <div id="container">
            <div id="map-container" role="application" tabIndex="-1">
              <div id="map" role="region"></div>
            </div>
            <div className="listView">
              <input id="FilteringText" className="search-locations" type="text" placeholder="Search Gym" value={query} onChange={(event)=> this.updatequery(event.target.value)} role="search" tabIndex="1"/>
              <ul className="location-list" tabIndex="1">
                {showingLocations.map((locationI, index)=>
                  <li key={index} tabIndex={index+2} onKeyPress={this.handleKeyPress.bind(this,locationI)} onClick={this.locationItem.bind(this,locationI)}>{locationI.title}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )
    }
  }
  export default App

  function loadMapJS(src) {
  var ref = window.document.getElementsByTagName("script")[0]
  var script = window.document.createElement("script")
  script.src = src
  script.async = true
  script.onerror = function() {
    document.write("CAN NOT LOAD GOOGLE MAP!!!")
  }
  ref.parentNode.insertBefore(script, ref)
}
