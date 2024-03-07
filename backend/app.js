const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const tf = require("@tensorflow/tfjs-node");
const { trainModel } = require("./trainModel");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

let model;
let foundationLabels;

async function loadModel() {
  const { model: loadedModel, foundationLabels: loadedFoundationLabels } =
    await trainModel({
      epochs: 25,
      units: 50,
      batchSize: 64,
      learningRate: 0.25,
    });

  model = loadedModel;
  foundationLabels = loadedFoundationLabels;

  console.log("Model loaded successfully");
}

app.post("/predict", async (req, res) => {
  if (!model) {
    return res.status(500).send("Model is not loaded yet");
  }
  const [r, g, b] = req.body.rgb.map((value) => value / 255);
  const inputTensor = tf.tensor2d([[r, g, b]]);
  const prediction = model.predict(inputTensor);
  const predictedIndex = prediction.argMax(1).dataSync()[0];
  const matchedShade = foundationLabels[predictedIndex];

  res.json({ foundation: matchedShade });
});

// Start the server and train the model
if (require.main === module) {
  loadModel().then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  });
} else {
  module.exports = app;
}
