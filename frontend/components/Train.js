import React, { useState, useCallback } from "react";
import Upload from "./Upload";
import Predict from "./Predict";
import "../scss/train.scss";

const Train = () => {
  const [state, setState] = useState({
    loading: false,
    foundation: "None",
    rgb: [],
  });

  const setRGB = useCallback((rgb) => {
    setState((prevState) => ({ ...prevState, rgb }));
  }, []);

  const setFoundation = useCallback((foundation) => {
    setState((prevState) => ({ ...prevState, foundation }));
  }, []);

  const { loading, foundation, rgb } = state;

  return (
    <div>
      <Upload loading={loading} rgb={rgb} setRGB={setRGB} />
      <div className="divider"></div>
      <Predict
        loading={loading}
        rgb={rgb}
        foundation={foundation}
        setFoundation={setFoundation}
      />
    </div>
  );
};

export default Train;
