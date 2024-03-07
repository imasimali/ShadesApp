import React, { useState, useCallback } from "react";
import shadesData from "../data/shades.json";
import * as tf from "@tensorflow/tfjs";
import Upload from "./Upload";
import Predict from "./Predict";
import "../scss/train.scss";

let model;
let foundationLabels;

const Train = () => {
  const [state, setState] = useState({
    loading: false,
    currentEpoch: 0,
    lossResult: 0.0,
    epochs: 25,
    units: 20,
    batchSize: 32,
    learningRate: 0.25,
    foundation: "None",
    rgb: [],
  });

  const hexToRgb = useCallback((hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const hexadecimal = hex.replace(
      shorthandRegex,
      (m, r, g, b) => r + r + g + g + b + b
    );
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      hexadecimal
    );
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }, []);

  const trainModel = useCallback(async () => {
    setState((prevState) => ({
      ...prevState,
      loading: true,
      foundation: "None",
    }));
    const { epochs, units, batchSize, learningRate } = state;

    foundationLabels = shadesData
      .map((shade) => `${shade.brand} ${shade.product} - ${shade.shade}`)
      .reduce((accumulator, currentShade) => {
        if (accumulator.indexOf(currentShade) === -1) {
          accumulator.push(currentShade);
        }
        return accumulator;
      }, []);

    const hexList = shadesData.map((shade) => shade.hex);
    const rgbList = hexList.map((hex) => hexToRgb(hex));

    let shadeColors = [];
    let foundations = [];

    shadesData.forEach((shade) => {
      foundations.push(
        foundationLabels.indexOf(
          `${shade.brand} ${shade.product} - ${shade.shade}`
        )
      );
    });

    rgbList.forEach((rgbColor) => {
      let shadeColor = [rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255];
      shadeColors.push(shadeColor);
    });

    const inputs = tf.tensor2d(shadeColors);
    const outputs = tf
      .oneHot(tf.tensor1d(foundations, "int32"), 584)
      .cast("float32");

    model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: parseInt(units),
        inputShape: [3],
        activation: "sigmoid",
      })
    );
    model.add(
      tf.layers.dense({
        units: 584,
        activation: "softmax",
      })
    );

    const optimizer = tf.train.sgd(parseFloat(learningRate));

    model.compile({
      optimizer,
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });

    const options = {
      epochs: parseInt(epochs),
      batchSize: parseInt(batchSize),
      shuffle: true,
      validationSplit: 0.1,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          setState((prevState) => ({
            ...prevState,
            currentEpoch: epoch + 1,
            lossResult: logs.loss.toFixed(3),
          }));
        },
        onBatchEnd: tf.nextFrame,
        onTrainEnd: () => {
          setState((prevState) => ({ ...prevState, loading: false }));
        },
      },
    };

    await model
      .fit(inputs, outputs, options)
      .then((results) => console.log("results", results));
  }, [state, hexToRgb]);

  const resetModel = useCallback(() => {
    setState({
      loading: false,
      currentEpoch: 0,
      lossResult: 0.0,
      epochs: 25,
      batchSize: 32,
      units: 20,
      learningRate: 0.25,
      foundation: "None",
    });
  }, []);

  const updateValue = useCallback((evt) => {
    const { name, value } = evt.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value !== "" && parseFloat(value) > 0 ? value : prevState[name],
    }));
  }, []);

  const getValue = useCallback(
    (evt) => {
      evt.target.value = state[evt.target.name];
    },
    [state]
  );

  const clearValue = useCallback((evt) => {
    evt.target.value = "";
  }, []);

  const setRGB = useCallback((rgb) => {
    setState((prevState) => ({ ...prevState, rgb }));
  }, []);

  const setFoundation = useCallback((foundation) => {
    setState((prevState) => ({ ...prevState, foundation }));
  }, []);

  const {
    loading,
    currentEpoch,
    lossResult,
    epochs,
    units,
    batchSize,
    learningRate,
    foundation,
    rgb,
  } = state;

  return (
    <div>
      <div className="divider"></div>
      <div className="train-results">
        <h2>Training Results</h2>
        <div className="train-result">
          <span>Epoch:</span>
          <span>{currentEpoch}</span>
        </div>
        <div className="train-result">
          <span>Loss:</span>
          <span>{lossResult}</span>
        </div>
      </div>
      <div className="train-inputs">
        <div className="input-group">
          <div className="input-container">
            <label className="label" htmlFor="epochs">
              Epochs
            </label>
            <input
              type="text"
              name="epochs"
              className="input"
              id="epochs"
              value={epochs}
              onFocus={clearValue}
              onBlur={getValue}
              onChange={updateValue}
            ></input>
          </div>
          <div className="input-container">
            <label className="label" htmlFor="units">
              Units
            </label>
            <input
              type="text"
              name="units"
              className="input"
              id="units"
              value={units}
              onFocus={clearValue}
              onBlur={getValue}
              onChange={updateValue}
            ></input>
          </div>
        </div>
        <div className="input-group">
          <div className="input-container">
            <label className="label" htmlFor="batch-size">
              Batch Size
            </label>
            <input
              type="text"
              name="batchSize"
              className="input"
              id="batch-size"
              value={batchSize}
              onFocus={clearValue}
              onBlur={getValue}
              onChange={updateValue}
            ></input>
          </div>
          <div className="input-container">
            <label className="label" htmlFor="learning-rate">
              Learning Rate
            </label>
            <input
              type="text"
              name="learningRate"
              className="input"
              id="learning-rate"
              value={learningRate}
              onFocus={clearValue}
              onBlur={getValue}
              onChange={updateValue}
            ></input>
          </div>
        </div>
      </div>
      <div className="train-model">
        <div
          className={`train-model-button ${loading ? "disabled" : ""}`}
          onClick={trainModel}
        >
          {loading ? (
            <div className="loader">
              <div className="inner one"></div>
              <div className="inner two"></div>
              <div className="inner three"></div>
            </div>
          ) : (
            "Train Model"
          )}
        </div>
        <div
          className={`train-model-button ${loading ? "disabled" : ""}`}
          onClick={resetModel}
        >
          {loading ? (
            <div className="loader">
              <div className="inner one"></div>
              <div className="inner two"></div>
              <div className="inner three"></div>
            </div>
          ) : (
            "Reset"
          )}
        </div>
      </div>
      <div className="divider"></div>
      <Upload loading={loading} rgb={rgb} setRGB={setRGB} />
      <div className="divider"></div>
      <Predict
        loading={loading}
        rgb={rgb}
        model={model}
        foundation={foundation}
        foundationLabels={foundationLabels}
        setFoundation={setFoundation}
      />
    </div>
  );
};

export default Train;
