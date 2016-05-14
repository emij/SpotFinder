/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight
} from 'react-native';
import Camera from 'react-native-camera';

class CameraApp extends Component {
  componentDidMount() {
	  var interval = setInterval(() => {this.takePicture()}, 5000);
  }
  
  render() {
	console.log("Render");
    return (
      <View style={styles.container}>
        <Camera ref={(cam) => {
          this.camera = cam;
        }}
        style={styles.preview}
        aspect={Camera.constants.Aspect.fill}
		captureTarget={Camera.constants.CaptureTarget.memory}>
        </Camera>
      </View>
    );
  }

  takePicture() {
    this.camera.capture()
      .then((data) => uploadFile(data))
      .catch(err => console.error(err));
  }
}

function uploadFile(data) {
	fetch("https://b5f3edbe.ngrok.io/camera", {
	  method: 'POST',
	  headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
	  },
	  body: data['data']
	});
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  }
});

AppRegistry.registerComponent('CameraApp', () => CameraApp);
