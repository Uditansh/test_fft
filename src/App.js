import React, { useState, useEffect } from "react";
import { fft, util as fftUtil } from "fft-js";
import Plot from "react-plotly.js";
import { ref, onValue } from "./firebase"; // Adjust the path accordingly
import { database } from "./firebase";
function App() {
  const [fftData, setFFTData] = useState([]);
  const [keyValueData, setKeyValueData] = useState([]);

  useEffect(() => {
    const dataRef = ref(database, "measures");

    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Firebase Data:", data);

      if (data != null) {
        calculateFFT(data);
      }
    });
  }, [fftData]);

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
  };

  useEffect(() => {
    const dataRef = ref(database, "measures");

    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Firebase Data:", data);

      if (data != null) {
        calculateFFT(data);

        const keyValueResult = Object.keys(data).map((uniqueId) => {
          const { time, value } = data[uniqueId];
          return { time, value };
        });

        console.log("Key-Value Data:", keyValueResult);
        setKeyValueData(keyValueResult);
      }
    });
  }, [calculateFFT]);
  // eslint-disable-next-line react-hooks/exhaustive-deps



  const padData = (data) => {
    const originalLength = data.length;
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(originalLength)));
    const paddedLength = Math.max(originalLength, nextPowerOf2); // Ensure padding for odd lengths

    return data.concat(Array(paddedLength - originalLength).fill(0));
  };

  return (
    <div className="App">
      <h1>FFT React App</h1>
      <div>
        <h2>FFT Plot</h2>
        <Plot
          data={[
            {
              x: fftData.map((point) => point.frequency),
              y: fftData.map((point) => point.magnitude),
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
              x: keyValueData.map((point) => point.time),
              y: keyValueData.map((point) => point.value),
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
    </div>
  );
}

export default App;
