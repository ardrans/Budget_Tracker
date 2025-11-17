import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { fetchBudgetSummary } from '../../api/api';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const currency = localStorage.getItem('currency') || 'INR';

  const formatCurrency = (value) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${currency} ${value}`;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBudgetSummary(selectedYear, selectedMonth);
        setSummary(data);
      } catch (error) {
        console.error('Error fetching monthly summary:', error);
        setSummary({
          total_income: 0,
          total_expense: 0,
          balance: 0,
          category_summary: [],
        });
      }
    };
    fetchData();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (summary) {
      drawCharts();
    }
  }, [summary]);

  const drawCharts = () => {
    d3.select('#income-expense-chart').selectAll('*').remove();
    d3.select('#category-chart').selectAll('*').remove();

    const tooltip = d3.select(".dashboard")
      .append("div")
      .style("position", "absolute")
      .style("background", "#333")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const pieData = [
      { label: 'Income', value: summary.total_income },
      { label: 'Expense', value: summary.total_expense },
    ];

    const width = 320;
    const height = 320;
    const radius = Math.min(width, height) / 2;

    const pieSvg = d3
      .select('#income-expense-chart')
      .append('svg')
      .attr('width', width + 120)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const color = d3.scaleOrdinal()
      .domain(pieData.map((d) => d.label))
      .range(['#4caf50', '#f44336']);

    pieSvg.selectAll('path')
      .data(pie(pieData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.label))
      .on("mouseover", function (e, d) {
        tooltip
          .style("opacity", 1)
          .html(`${d.data.label}: ${formatCurrency(d.data.value)}`);
      })
      .on("mousemove", function (e) {
        tooltip.style("left", e.pageX + 15 + "px")
               .style("top", e.pageY + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    const legend = pieSvg
      .append('g')
      .attr('transform', `translate(${radius + 20}, -${radius})`);

    legend.selectAll('rect')
      .data(pieData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (_, i) => i * 20)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', (d) => color(d.label));

    legend.selectAll('text')
      .data(pieData)
      .enter()
      .append('text')
      .attr('x', 20)
      .attr('y', (_, i) => i * 20 + 10)
      .style('font-size', '12px')
      .text((d) => d.label);

    // BAR CHART: Category Summary
    const barWidth = 350;
    const barHeight = 300;
    const catData = summary.category_summary;

    const catSvg = d3
      .select('#category-chart')
      .append('svg')
      .attr('width', barWidth + 80)
      .attr('height', barHeight);

    const x = d3.scaleBand()
      .domain(catData.map((d) => d.category))
      .range([40, barWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(catData, (d) => d.total) || 1])
      .nice()
      .range([barHeight - 30, 20]);

    catSvg.append('g')
      .attr('transform', `translate(0,${barHeight - 30})`)
      .call(d3.axisBottom(x));

    catSvg.append('g')
      .attr('transform', 'translate(40,0)')
      .call(d3.axisLeft(y));

    catSvg.selectAll('rect.bar')
      .data(catData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.category))
      .attr('y', (d) => y(d.total))
      .attr('width', x.bandwidth())
      .attr('height', (d) => barHeight - 30 - y(d.total))
      .attr('fill', '#2196f3')
      .on("mouseover", function (e, d) {
        tooltip
          .style("opacity", 1)
          .html(`${d.category}: ${formatCurrency(d.total)}`);
      })
      .on("mousemove", function (e) {
        tooltip.style("left", e.pageX + 15 + "px")
               .style("top", e.pageY + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    catSvg.selectAll('text.value')
      .data(catData)
      .enter()
      .append('text')
      .attr('class', 'value')
      .attr('x', (d) => x(d.category) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.total) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text((d) => formatCurrency(d.total));

    catSvg.append('rect')
      .attr('x', barWidth + 20)
      .attr('y', 20)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#2196f3');

    catSvg.append('text')
      .attr('x', barWidth + 40)
      .attr('y', 30)
      .style('font-size', '12px')
      .text('Total');
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i);
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Monthly Summary</h1>
          <p>Overview of your income, expenses, and budget</p>
        </div>

        <div className="date-filter">
          <div className="filter-group">
            <label htmlFor="month-select">Month:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="month-year-select"
            >
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="year-select">Year:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="month-year-select"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {summary ? (
        <>
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Total Income</h3>
                <p className="card-value">{formatCurrency(summary.total_income)}</p>
              </div>
            </div>

            <div className="summary-card expense">
              <div className="card-icon">💸</div>
              <div className="card-content">
                <h3>Total Expense</h3>
                <p className="card-value">{formatCurrency(summary.total_expense)}</p>
              </div>
            </div>

            <div
              className={`summary-card balance ${
                summary.balance >= 0 ? 'positive' : 'negative'
              }`}
            >
              <div className="card-icon">⚖️</div>
              <div className="card-content">
                <h3>Balance</h3>
                <p className="card-value">{formatCurrency(summary.balance)}</p>
              </div>
            </div>
          </div>

          <div className="charts-section">
            <div id="income-expense-chart" className="chart-card"></div>
            <div id="category-chart" className="chart-card"></div>
          </div>
        </>
      ) : (
        <div className="no-data">Loading...</div>
      )}
    </div>
  );
};

export default Dashboard;
