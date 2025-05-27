import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StockChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get('https://api.twelvedata.com/time_series?apikey=6fd0fb05717c452f92e731863bc666f5&interval=1min', {
          params: {
            symbol: 'AAPL',
            interval: '1day',
            outputsize: 30,
            apikey: import.meta.env.VITE_TWELVE_DATA_API_KEY
          }
        });

        const formattedData = response.data.values.reverse().map(item => ({
          datetime: item.datetime,
          open: parseFloat(item.open),
          close: parseFloat(item.close)
        }));

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchStock();
  }, []);

  return (
    <div style={{ width: '100%', height: 500 }}>
      <h2>Apple (AAPL) - Open vs Close Prices</h2>
      <ResponsiveContainer>
        {/* <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="datetime" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="open" stroke="#8884d8" name="Open Price" />
          <Line type="monotone" dataKey="close" stroke="#82ca9d" name="Close Price" />
        </LineChart> */}

        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="datetime" tick={{ fontSize: 10 }} />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} /> {/* 🔧 custom scale */}
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="open" stroke="#8884d8" name="Open Price" />
          <Line type="monotone" dataKey="close" stroke="#82ca9d" name="Close Price" />
        </LineChart>

      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
