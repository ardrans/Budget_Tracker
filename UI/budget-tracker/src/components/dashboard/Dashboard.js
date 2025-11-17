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

  // Formatter function
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
    const fetchSummary = async () => {
      try {
        const data = await fetchBudgetSummary(selectedYear, selectedMonth);
        setSummary(data);
      } catch (error) {
        console.error('Error fetching monthly summary:', error);
      }
    };
    fetchSummary();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (summary) {
      drawCharts();
    }
  }, [summary]);

  const drawCharts = () => {
    d3.select('#income-expense-chart').selectAll('*').remove();
    d3.select('#category-chart').selectAll('*').remove();

    // Pie chart: Income vs Expense
    const pieData = [
      { label: 'Income', value: summary.total_income },
      { label: 'Expense', value: summary.total_expense },
    ];

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const pieSvg = d3
      .select('#income-expense-chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const color = d3.scaleOrdinal()
      .domain(pieData.map((d) => d.label))
      .range(['#4caf50', '#f44336']);

    pieSvg
      .selectAll('path')
      .data(pie(pieData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.label));

    // Bar chart: Category expenses
    const catData = summary.category_summary;
    const catSvg = d3
      .select('#category-chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const x = d3
      .scaleBand()
      .domain(catData.map((d) => d.category))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(catData, (d) => d.total)])
      .nice()
      .range([height - 30, 0]);

    catSvg
      .append('g')
      .attr('transform', `translate(0,${height - 30})`)
      .call(d3.axisBottom(x));

    catSvg
      .append('g')
      .attr('transform', 'translate(30,0)')
      .call(d3.axisLeft(y));

    catSvg
      .selectAll('rect')
      .data(catData)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.category))
      .attr('y', (d) => y(d.total))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - 30 - y(d.total))
      .attr('fill', '#2196f3');
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
