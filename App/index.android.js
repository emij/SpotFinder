'use strict';
console.log("Starting app");
var React = require('react-native');
var Mapbox = require('react-native-mapbox-gl');
var mapRef = 'OpenStreetMap';
var {
  AppRegistry,
  StyleSheet,
  View,
  Text
} = React;
var freespots=[true,true,true,true,true,true,true,true,true,true];
var map = React.createClass({
  mixins: [Mapbox.Mixin],
  getInitialState() {
    
    return {
      center: {
        latitude: 57.6979021,
        longitude: 11.9915709
      },
      zoom: 15
    }
  },
  onUserLocationChange(location) {
    console.log(location);
  },
  onLongPress(location) {
    console.log(location);
  },
  onOpenAnnotation(annotation) {
    console.log(annotation);
  },
  render() {
    function createParkings(){
      var baseLatitude=57.6977021;
      var baseLongitude=11.9915109;
      var retArray= [];
      for (var i = 0; i < 7; i++) {
        if(freespots[i]){
          retArray.push(createParking('v',1,baseLatitude, baseLongitude+0.00023*i));
        }
      }
      for (var i = 0; i < 4; i++) {
        if(freespots[i+7]){
          retArray.push(createParking('h',7,baseLatitude+0.0004, baseLongitude+(0.000215*2*i)));
        }
      }
      /*createParking('v',0,baseLatitude,baseLongitude ),
      createParking('v',1,baseLatitude, baseLongitude+0.00023),
      createParking('v',2,baseLatitude, baseLongitude+(0.00023*2)),
      createParking('v',3,baseLatitude, baseLongitude+(0.00023*3)),
      createParking('v',4,baseLatitude, baseLongitude+(0.00023*4)),
      createParking('v',5,baseLatitude, baseLongitude+(0.00023*5)),
      createParking('v',6,baseLatitude, baseLongitude+(0.00023*6)),
      createParking('h',7,baseLatitude+0.0004, baseLongitude),
      createParking('h',8,baseLatitude+0.0004, baseLongitude+(0.000215*2)),
      createParking('h',9,baseLatitude+0.0004, baseLongitude+(0.000215*4)),
      createParking('h',10,baseLatitude+0.0004, baseLongitude+(0.000215*6))
      ];*/

      return retArray;

    }
    function createParking(vertical,id,latitude,longitude){


      if(vertical=="v"){
        var width=0.0002;
        var heigth=0.0002;


        return   {
          "coordinates": [
            [latitude+width, longitude],
            [latitude+width, heigth+longitude],
            [latitude, heigth+longitude],
            [latitude, longitude]
          ],
          "type": "polygon",
          "fillColor":"#00FB00",
          "fillAlpha": 0.5,
          "strokeWidth": 3,
          "strokeAlpha": 0.5
        }

      }else{
        var width=0.0001;
        var heigth=0.0004;

        return   {
          "coordinates": [
            [latitude+width, longitude],
            [latitude+width, heigth+longitude],
            [latitude, heigth+longitude],
            [latitude, longitude]
          ],
          "type": "polygon",
          "fillColor": "#00FB00",
          "strokeWidth": 3,
          "strokeAlpha": 0.5
        }

      }
    }

    return (
      <View style={styles.container}>

        <Mapbox
          style={styles.container}
          direction={0}
          rotateEnabled={false}
          scrollEnabled={true}
          zoomEnabled={true}
          showsUserLocation={false}
          ref={mapRef}
          accessToken={'pk.eyJ1IjoiYmFya2l0IiwiYSI6ImNpbzZ1eW96ZTAwNTB2cmx5cWh4aHd5ajUifQ.Tb7g3ZNACzlgxZWnraqfwg'}
          styleURL={'https://raw.githubusercontent.com/osm2vectortiles/osm2vectortiles/gh-pages/styles/bright-v8.json'}
          centerCoordinate={this.state.center}
          zoomLevel={this.state.zoom}
          logoIsHidden={true}
          attributionButtonIsHidden={true}
          annotations={createParkings()}
          onUserLocationChange={this.onUserLocationChange}
          onLongPress={this.onLongPress}
          onOpenAnnotation={this.onOpenAnnotation}
          />
      </View>
    );

  }
});



const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

AppRegistry.registerComponent('map', () => map);
