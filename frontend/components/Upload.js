import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

const Upload = (props) => {
    const measure = useRef(null);
    const canvas = useRef(null);
    const colorPicker = useRef(null);

    const defaultCanvas = () => {
        const ctx = canvas.current.getContext('2d');
        canvas.current.width = canvas.current.offsetWidth;
        canvas.current.height = canvas.current.offsetWidth;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.current.width, canvas.current.height);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#000";
        ctx.strokeRect(0, 0, canvas.current.width, canvas.current.height);
        ctx.font = "125px Arial";
        ctx.textAlign="center";
        ctx.textBaseline = "middle";
        ctx.fillText('📷', canvas.current.width / 2, canvas.current.height / 2);
    };

    useEffect(() => {
        defaultCanvas();
    }, []);

    const uploadImage = (evt) => {
        defaultCanvas();
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                measure.current.appendChild(img);
                const ratio = img.width / img.height;
                let newWidth = canvas.current.width;
                let newHeight = newWidth / ratio;

                if (newHeight > canvas.current.height) {
                    newHeight = canvas.current.height;
                    newWidth = newHeight * ratio;
                }

                measure.current.removeChild(img);
                const ctx = canvas.current.getContext('2d');

                if (newWidth < canvas.current.width) {
                    ctx.drawImage(img, 50, 0, newWidth, newHeight);
                } else {
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
                }

                canvas.current.onclick = (event) => pickColor(event);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "#000";
                ctx.strokeRect(0, 0, canvas.current.width, canvas.current.height);
            };

            img.onerror = (error) => console.error(`Error: ${error}`);
            img.src = e.target.result;
        };

        if (evt.target.files[0]) {
            reader.readAsDataURL(evt.target.files[0]);
        }
    };

    const pickColor = (evt) => {
        const x = evt.nativeEvent.offsetX;
        const y = evt.nativeEvent.offsetY;
        const ctx = canvas.current.getContext('2d');
        const { data } = ctx.getImageData(x, y, 1, 1);
        props.setRGB([data[0], data[1], data[2]]);
    };

    return (
        <View>
            <View ref={measure} />
            <View>
                <canvas ref={canvas} />
                <img ref={colorPicker} />
            </View>
            <TouchableOpacity onPress={(e) => uploadImage(e)}>
                <Text>Upload Image</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Upload;
