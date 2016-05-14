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

var interval;

class CameraApp extends Component {
  render() {
    return (
      <View style={styles.container}>
	    <Text style={styles.capture} onPress={this.stopSending.bind(this)}>[STOP]</Text>
        <Camera ref={(cam) => {
          this.camera = cam;
        }}
        style={styles.preview}
        aspect={Camera.constants.Aspect.fill}
		keepAwake={true}
		captureQuality={Camera.constants.CaptureQuality.low}
		captureTarget={Camera.constants.CaptureTarget.memory}>
        </Camera>
		<Text style={styles.capture} onPress={this.takeInitPicture.bind(this)}>[START]</Text>
      </View>
    );
  }

  takePicture() {
    this.camera.capture()
      .then((data) => uploadFile(data, "camera"))
      .catch(err => console.error(err));
  }
  
  takeInitPicture() {
    this.camera.capture()
      .then((data) => uploadFile(data, "camera/init"))
      .catch(err => console.error(err));
	interval = setInterval(() => {this.takePicture()}, 5000);
  }
  
  stopSending() {
	  clearInterval(interval);
  }
}

function uploadFile(data, prefix) {
	fetch("https://7e358f52.ngrok.io/" + prefix, {
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
	backgroundColor: '#000',
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
    margin: 20
  }
});

AppRegistry.registerComponent('CameraApp', () => CameraApp);
