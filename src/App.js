import React, { useState, useEffect, useRef } from "react";
import { fft, util as fftUtil } from "fft-js";
import Plot from "react-plotly.js";
import { ref, onValue } from "./firebase"; // Adjust the path accordingly
import { database } from "./firebase";

function App() {
  const [fftData, setFFTData] = useState([]);
  const [keyValueData, setKeyValueData] = useState([]);
  const [windowStartIndex, setWindowStartIndex] = useState(0);
  const [latestDataIndex, setLatestDataIndex] = useState(0);
  const windowSize = 10; // Number of data points to show in the window
  const dataRef = useRef(ref(database, "measures"));

  const calculateFFT = (data) => {
    console.log(data);
    // Ensure data is not empty or undefined
    if (!data || Object.keys(data).length === 0) {
      console.error("Invalid data for FFT calculation");
      return;
    }

    const fftResult = Object.keys(data).map((uniqueId) => {
      const { time, value } = data[uniqueId];
      return { time, value };
    });

    setKeyValueData(fftResult);

    const values = fftResult.map((point) => point.value);

    // Ensure values array is not empty
    if (values.length === 0) {
      console.error("Values array for FFT calculation is empty");
      return;
    }

    // Pad the values array to the next power of 2
    const paddedValues = padData(values);

    // Perform FFT calculation
    const phasors = fft(paddedValues);
    const frequencies = fftUtil.fftFreq(phasors, 8000);
    const magnitudes = fftUtil.fftMag(phasors);

    const fftResultData = frequencies.map((f, ix) => ({
      frequency: f,
      magnitude: magnitudes[ix],
    }));

    setFFTData(fftResultData);

    // Update the latest data index
    setLatestDataIndex(fftResult.length - 1);
  };

  const padData = (data) => {
    const originalLength = data.length;
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(originalLength)));
    const paddedLength = Math.max(originalLength, nextPowerOf2); // Ensure padding for odd lengths

    return data.concat(Array(paddedLength - originalLength).fill(0));
  };

  useEffect(() => {
    const onDataChange = (snapshot) => {
      const data = snapshot.val();
      console.log("Firebase Data:", data);

      if (data != null) {
        calculateFFT(data);

        // Set the initial windowStartIndex to display the latest data window
        setWindowStartIndex(Math.max(0, latestDataIndex - windowSize + 1));
      }
    };

    const unsubscribe = onValue(dataRef.current, onDataChange);

    return () => {
      // Unsubscribe when the component is unmounted
      unsubscribe();
    };
  }, [windowSize, latestDataIndex]);

  const handleNextClick = () => {
    setWindowStartIndex((prevIndex) => Math.min(prevIndex + windowSize, latestDataIndex - windowSize + 1));
  };

  const handlePrevClick = () => {
    setWindowStartIndex((prevIndex) => Math.max(0, prevIndex - windowSize));
  };

  const slicedFFTData = fftData.slice(windowStartIndex, windowStartIndex + windowSize);
  const slicedKeyValueData = keyValueData.slice(windowStartIndex, windowStartIndex + windowSize);

  return (
    <div className="App">
      <h1>FFT React App</h1>
      <div>
        <h2>FFT Plot</h2>
        <Plot
          data={[
            {
              x: slicedFFTData.map((point) => point.frequency),
              y: slicedFFTData.map((point) => point.magnitude),
              type: "scatter",
              mode: "lines",
              name: "FFT Plot",
            },
          ]}
          layout={{
            width: 800,
            height: 400,
            title: "FFT Plot",
            xaxis: { title: "Frequency (Hz)" },
            yaxis: { title: "Magnitude" },
          }}
        />
      </div>
      <div>
        <h2>Key-Value Plot</h2>
        <Plot
          data={[
            {
              x: slicedKeyValueData.map((point) => point.time),
              y: slicedKeyValueData.map((point) => point.value),
              type: "scatter",
              mode: "lines",
              name: "Key-Value Plot",
            },
          ]}
          layout={{
            width: 800,
            height: 400,
            title: "Key-Value Plot",
            xaxis: { title: "Key" },
            yaxis: { title: "Value" },
          }}
        />
      </div>
      <div>
        <button onClick={handlePrevClick} disabled={windowStartIndex === 0}>
          Previous
        </button>
        <button onClick={handleNextClick} disabled={windowStartIndex + windowSize >= latestDataIndex}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
