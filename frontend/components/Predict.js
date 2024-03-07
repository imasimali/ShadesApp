import React from "react";
import "../scss/predict.scss";

function Predict({ rgb, setFoundation, loading, foundation }) {
  const predictModel = async () => {
    const [r, g, b] = rgb;
    try {
      const response = await fetch(`${process.env.API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rgb: [r, g, b] }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setFoundation(data.foundation);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  return (
    <div className="predict-model">
      <div className="predict-results">
        <h2>Prediction Results</h2>
        <div className="predict-result">
          <span>Foundation Match:</span>
          <span>{foundation}</span>
        </div>
      </div>
      <div
        className={`predict-model-button ${loading ? "disabled" : ""}`}
        onClick={!loading ? predictModel : undefined}
      >
        {loading ? (
          <div className="loader">
            <div className="inner one"></div>
            <div className="inner two"></div>
            <div className="inner three"></div>
          </div>
        ) : (
          "Run Analysis"
        )}
      </div>
    </div>
  );
}

export default Predict;
