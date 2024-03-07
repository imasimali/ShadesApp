const tf = require("@tensorflow/tfjs-node");
const shadesData = require("./shades.json");

async function trainModel(options) {
  const { epochs, units, batchSize, learningRate } = options;

  let foundationLabels = shadesData
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

  for (const shade of shadesData) {
    foundations.push(
      foundationLabels.indexOf(
        `${shade.brand} ${shade.product} - ${shade.shade}`
      )
    );
  }

  for (const rgbColor of rgbList) {
    let shadeColor = [rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255];
    shadeColors.push(shadeColor);
  }

  const inputs = tf.tensor2d(shadeColors);
  const outputs = tf
    .oneHot(tf.tensor1d(foundations, "int32"), foundationLabels.length)
    .cast("float32");

  let model = tf.sequential();

  model.add(
    tf.layers.dense({
      units: parseInt(units),
      inputShape: [3],
      activation: "sigmoid",
    })
  );

  model.add(
    tf.layers.dense({
      units: foundationLabels.length,
      activation: "softmax",
    })
  );

  const optimizer = tf.train.sgd(parseFloat(learningRate));

  model.compile({
    optimizer: optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  const fitOptions = {
    epochs: parseInt(epochs),
    batchSize: parseInt(batchSize),
    shuffle: true,
    validationSplit: 0.1,
  };

  return model.fit(inputs, outputs, fitOptions).then((results) => {
    console.log("Training results", results);
    return { model, foundationLabels };
  });
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  if (!hex) console.error("Error: No hex value provided");

  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(
    shorthandRegex,
    (m, r, g, b) => r + r + g + g + b + b
  );
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

module.exports = { trainModel };
