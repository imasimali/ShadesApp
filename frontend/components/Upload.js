import React, { useRef, useEffect } from "react";
import "../scss/upload.scss";

function Upload({ loading, rgb, setRGB }) {
  const measure = useRef(null);
  const canvas = useRef(null);
  const colorPicker = useRef(null);

  const uploadImage = (evt) => {
    defaultCanvas();

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      const context = canvas.current.getContext("2d");
      img.onload = () => {
        measure.current.appendChild(img);
        const imageRatio = img.width / img.height;
        let newWidth = canvas.current.width;
        let newHeight = newWidth / imageRatio;

        if (newHeight > canvas.current.height) {
          newHeight = canvas.current.height;
          newWidth = newHeight * imageRatio;
        }

        measure.current.removeChild(img);

        if (newWidth < canvas.current.width) {
          context.drawImage(
            img,
            (canvas.current.width - newWidth) / 2,
            0,
            newWidth,
            newHeight
          );
        } else {
          context.drawImage(img, 0, 0, newWidth, newHeight);
        }

        canvas.current.onclick = (event) => pickColor(event);

        context.lineWidth = 5;
        context.strokeStyle = "#000";
        context.strokeRect(0, 0, canvas.current.width, canvas.current.height);
      };
      img.onerror = (err) => console.error(`Error: ${err}`);
      img.src = event.target.result;
    };

    if (evt.target.files[0]) {
      reader.readAsDataURL(evt.target.files[0]);
    }
  };

  const pickColor = (evt) => {
    const context = canvas.current.getContext("2d");
    const { offsetX: x, offsetY: y } = evt;
    const imageData = context.getImageData(x, y, 1, 1).data;
    const rgb = [...imageData];
    setRGB(rgb);
  };

  const defaultCanvas = () => {
    const context = canvas.current.getContext("2d");
    canvas.current.width = canvas.current.offsetWidth;
    canvas.current.height = canvas.current.offsetWidth;

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.current.width, canvas.current.height);
    context.lineWidth = 5;
    context.strokeStyle = "#000";
    context.strokeRect(0, 0, canvas.current.width, canvas.current.height);
    context.font = "125px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("📷", canvas.current.width / 2, canvas.current.height / 2);
  };

  useEffect(() => {
    defaultCanvas();
  }, []);

  const [r, g, b] = rgb;
  return (
    <div className="upload">
      <div ref={measure} className="measure"></div>
      <div className="canvas-container">
        <canvas ref={canvas} className="canvas"></canvas>
        <img
          style={{ backgroundColor: `rgba(${r}, ${g}, ${b})` }}
          ref={colorPicker}
          className="color-picker"
          alt=""
        />
      </div>
      <div className={`upload-button-container ${loading ? "disabled" : ""}`}>
        <label
          className={`upload-label ${loading ? "disabled" : ""}`}
          htmlFor="upload-button"
        >
          {loading ? (
            <div className="loader">
              <div className="inner one"></div>
              <div className="inner two"></div>
              <div className="inner three"></div>
            </div>
          ) : (
            "Upload Image"
          )}
        </label>
        <input
          type="file"
          className="upload-button"
          id="upload-button"
          onChange={uploadImage}
        />
      </div>
    </div>
  );
}

export default Upload;
