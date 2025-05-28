
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

const StockChart = () => {
  const [data, setData] = useState([]);
  const svgRef = useRef();

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get('https://api.twelvedata.com/time_series?symbol=AAPL&interval=1day&outputsize=30&apikey=6fd0fb05717c452f92e731863bc666f5', {
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

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear SVG before redraw

    const width = 800;
    const height = 400;
    const margin = { top: 30, right: 50, bottom: 50, left: 60 };

    svg
      .attr('viewBox', [0, 0, width, height])
      .style('font', '12px sans-serif');

    const x = d3.scalePoint()
      .domain(data.map(d => d.datetime))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.open, d.close)) - 5,
        d3.max(data, d => Math.max(d.open, d.close)) + 5
      ])
      .range([height - margin.bottom, margin.top]);

    const xAxis = g =>
      g.attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d => d.slice(5)).tickValues(x.domain().filter((_, i) => i % 5 === 0)))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    const yAxis = g =>
      g.attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    const lineOpen = d3.line()
      .x(d => x(d.datetime))
      .y(d => y(d.open));

    const lineClose = d3.line()
      .x(d => x(d.datetime))
      .y(d => y(d.close));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    // Gridlines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat(''));

    // Open Line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#8884d8')
      .attr('stroke-width', 2)
      .attr('d', lineOpen);

    // Close Line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#82ca9d')
      .attr('stroke-width', 2)
      .attr('d', lineClose);

    // Add legend
    svg.append('text')
      .attr('x', width - 150)
      .attr('y', margin.top)
      .text('Open Price')
      .attr('fill', '#8884d8');

    svg.append('text')
      .attr('x', width - 150)
      .attr('y', margin.top + 20)
      .text('Close Price')
      .attr('fill', '#82ca9d');

  }, [data]);

  return (
    <div>
      <h2>Apple (AAPL) - Open vs Close Prices</h2>
      <svg ref={svgRef} width="100%" height="500px"></svg>
    </div>
  );
};

export default StockChart;
