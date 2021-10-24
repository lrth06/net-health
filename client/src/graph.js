import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

import { io } from "socket.io-client";
import './index.css'


const Graph = () => {
   //set state for time, download, upload, and latency with hooks
    const [timestamp, setTimestamp] = useState([]);
    const [download, setDownload] = useState([]);
    const [upload, setUpload] = useState([]);
    const [latency, setLatency] = useState([]);


    useEffect(() => {
        const socket = io('http://localhost:8889');

        socket.on('results', (data) => {
            console.log(data);
            //map through the data and set the state
            setTimestamp(data.map(d => d.timestamp));
            setDownload(data.map(d => d.download));
            setUpload(data.map(d => d.upload));
            setLatency(data.map(d => d.latency));
        });
        socket.on('averages',(average) => {
            console.log(average); 
        });
    }, []);
    const chartData = {
        //convert timestamp to human readable time
        labels: timestamp.map(d => new Date(d).toLocaleTimeString()),
        datasets: [
            {
                label: 'Download (Mbps)',
                data: download,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false,
            },
            {
                label: 'Upload (Mbps)',
                data: upload,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: false,
            },
            {
                type: 'scatter',
                label: 'Latency (ms)',
                data: latency,
                backgroundColor: 'rgba(50, 205, 50 , 0.2)',
                borderColor: 'rgba(50, 205, 50 , 1)',
                borderWidth: 1,
                fill: false,
            },
            
        ]
    };

//write inline styles for the graph to make it responsive
    const options = {
        responsive: true,
        Animation: {
            duration: 0
        },
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                fontColor: 'rgb(255, 99, 132)'
            }
        },
        title: {
            display: true,
            text: 'Network Performance'
        },
      
    };

    return (
        <div className="chart">
            <Line data={chartData} options={options} />
        </div>
    );
};
export default Graph;