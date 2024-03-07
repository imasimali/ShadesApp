import React from "react";
import ReactDOM from "react-dom";
import "babel-polyfill";
import "./scss/app.scss";

import Header from "./components/Header";
import Upload from "./components/Upload";
import Predict from "./components/Predict";
import Train from "./components/Train";

const App = (props) => {
  return (
    <div>
      <Header />
      <Train />
    </div>
  );
};
export default App;

ReactDOM.render(<App />, document.getElementById("app"));
