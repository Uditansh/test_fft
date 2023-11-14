import React, { useState, useEffect } from 'react';
import { fft, util as fftUtil } from 'fft-js';
import Plot from 'react-plotly.js';
import { ref, onValue } from './firebase'; // Adjust the path accordingly
import { database } from './firebase'; 
function App() {
  const [fftData, setFFTData] = useState([]);
  const [keyValueData, setKeyValueData] = useState([]);
 
  
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateFFT = (data) => {
    // Ensure data is not empty or undefined
    if (!data || Object.keys(data).length === 0) {
      console.error('Invalid data for FFT calculation');
      return;
    }
  
    const values = Object.keys(data).sort((a, b) => Number(a) - Number(b)).map((key) => Number(data[key]));
  
    // Ensure values array is not empty
    if (values.length === 0) {
      console.error('Values array for FFT calculation is empty');
      return;
    }
  
    // Pad the values array to the next power of 2
    const paddedValues = padData(values);
  
    // Perform FFT calculation
    const phasors = fft(paddedValues);
    const frequencies = fftUtil.fftFreq(phasors, 8000);
    const magnitudes = fftUtil.fftMag(phasors);
  
    const fftResult = frequencies.map((f, ix) => ({
      frequency: f,
      magnitude: magnitudes[ix],
    }));
  
    setFFTData(fftResult);
  };
  
 
const padData = (data) => {
  const originalLength = data.length;
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(originalLength)));
  const paddedLength = Math.max(originalLength, nextPowerOf2); // Ensure padding for odd lengths

  return data.concat(Array(paddedLength - originalLength).fill(0));
};

  
  
  

  useEffect(() => {
    const dataRef = ref(database, 'eegData');
  
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Firebase Data:', data);
  
      if (data != null) {
        calculateFFT(data);
  
        const keyValueResult = Object.keys(data).map((key) => ({
          key: Number(key),
          value: Number(data[key]),
        }));
  
        console.log('Key-Value Data:', keyValueResult);
        setKeyValueData(keyValueResult);
      }
    });
  }, [calculateFFT]);
  
  

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
              type: 'scatter',
              mode: 'lines',
              name: 'FFT Plot',
            },
          ]}
          layout={{
            width: 800,
            height: 400,
            title: 'FFT Plot',
            xaxis: { title: 'Frequency (Hz)' },
            yaxis: { title: 'Magnitude' },
          }}
        />
      </div>
      <div>
        <h2>Key-Value Plot</h2>
        <Plot
          data={[
            {
              x: keyValueData.map((point) => point.key),
              y: keyValueData.map((point) => point.value),
              type: 'scatter',
              mode: 'lines',
              name: 'Key-Value Plot',
            },
          ]}
          layout={{
            width: 800,
            height: 400,
            title: 'Key-Value Plot',
            xaxis: { title: 'Key' },
            yaxis: { title: 'Value' },
          }}
        />
      </div>
    </div>
  );
}

export default App;
