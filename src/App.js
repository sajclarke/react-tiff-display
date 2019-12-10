import React from "react";
import logo from "./logo.svg";
import axios from "axios";
import Tiff from "tiff.js";

import "./App.css";

Tiff.initialize({ TOTAL_MEMORY: 19777216 * 10 });
const imgURL = process.env.REACT_APP_API_SERVER;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      fileName: "",
      isFileLoading: false,
      percentLoaded: 0
    };
  }
  componentDidMount() {}

  _arrayBufferToBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  displayImage(fileName) {
    console.log("fetching image :" + fileName);
    axios
      .get(imgURL + fileName, {
        responseType: "arraybuffer",
        onDownloadProgress: progressEvent => {
          this.setState({ isFileLoading: true });

          // console.log(progressEvent);
          if (progressEvent.lengthComputable) {
            console.log(
              "Progress",
              (progressEvent.loaded / progressEvent.total) * 100
              // progressEvent.loaded + " " + progressEvent.total
            );

            this.setState({
              percentLoaded: (progressEvent.loaded / progressEvent.total) * 100
            });

            //  this.updateP/rogressBarValue(progressEvent);
          }
        }
      })
      .then(response => {
        console.log(response, response.headers["content-length"] / 1000000.0);
        // console.log(response.)
        //Detect type of image and display accordingly?
        if (response.headers["content-type"] === "image/tiff") {
          console.log("this IS a tiff image");
          var tiff = new Tiff({ buffer: response.data });
          var canvas = tiff.toDataURL();
          document.getElementById("img_display").src = canvas;
        } else {
          console.log("this is not a tiff image");
          document.getElementById("img_display").src =
            "data:image/png;base64," + this._arrayBufferToBase64(response.data);
        }

        this.setState({ isFileLoading: false });

        // document.getElementById("tiff_display").append(canvas);
      });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>Testing Tiff.js with React</p>
          <input
            type="text"
            placeholder="Type name of file"
            value={this.state.fileName}
            onChange={e => this.setState({ fileName: e.target.value })}
          />
          <button onClick={() => this.displayImage(this.state.fileName)}>
            Display Image
          </button>
          {this.state.isFileLoading ? (
            <div
              style={{
                textAlign: "center"
              }}
            >
              <div>
                <strong>{this.state.percentLoaded.toFixed(1)} %</strong>
              </div>
              <br />
              <progress
                max="100"
                value={this.state.percentLoaded.toFixed(1)}
              ></progress>
            </div>
          ) : (
            ""
          )}
          <img
            style={{
              visibility: this.state.isFileLoading ? "hidden" : "visible"
            }}
            id="img_display"
            src={logo}
            width="300px"
          />

          {/* <div id="tiff_display"></div> */}
        </header>
      </div>
    );
  }
}

export default App;
