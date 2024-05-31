document.addEventListener('DOMContentLoaded', function () {
  displayLastUpdatedDate();
});

function displayLastUpdatedDate() {
  const footer = document.getElementById('footer');
  const lastUpdated = document.lastModified;
  footer.innerText = `Last Updated: ${new Date(lastUpdated).toLocaleDateString()}`;
}

// Function to toggle dropdown visibility
function toggleDropdown(dropdownId) {
  const dropdownContent = document.getElementById(dropdownId);
  dropdownContent.classList.toggle("show");
}

// Close dropdowns when clicking outside
window.onclick = function (event) {
  if (!event.target.matches('.dropbtn')) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (const dropdown of dropdowns) {
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
    }
  }
};

function filterFunction(dropdownId, searchId) {
  const input = document.getElementById(searchId);
  const filter = input.value.toUpperCase();
  const div = document.getElementById(dropdownId);
  const options = div.getElementsByClassName("dropdown-option");
  for (let i = 0; i < options.length; i++) {
    const txtValue = options[i].textContent || options[i].innerText;
    options[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
  }
}

// Call fetchAndPopulateDropdown() on page load or when needed
window.onload = function () {
  fetchAndPopulateDropdown('categoryDropdown', 'category', handleCategorySelect);
  fetchAndPopulateDropdown('nameDropdown', 'name', handleNameSelect);
  fetchAndPopulateDropdown('dateDropdown', 'date', handleDateSelect);
};

function fetchAndPopulateDropdown(dropdownId, dataKey, onClickHandler) {
  fetch('datas.json')
    .then(response => response.json())
    .then(data => {
      const dropdown = document.getElementById(dropdownId);
      const searchInput = dropdown.querySelector('input');
      dropdown.innerHTML = '';
      dropdown.appendChild(searchInput);

      const allOption = document.createElement("div");
      allOption.className = "dropdown-option";
      allOption.innerHTML = `<input type="checkbox" value="all" onclick="${onClickHandler.name}()"> All`;
      dropdown.appendChild(allOption);

      const uniqueValues = new Set(data.map(item => item[dataKey]));
      for (const value of uniqueValues) {
        const option = document.createElement("div");
        option.className = "dropdown-option";
        option.innerHTML = `<input type="checkbox" value="${value}" onclick="${onClickHandler.name}()"> ${value}`;
        dropdown.appendChild(option);
      }
    })
    .catch(error => console.error("Error fetching data:", error));
}

function handleOptionSelect(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
  const selectedValues = Array.from(checkboxes).map(checkbox => checkbox.value);

  const selectedInputId = dropdownId + 'Selected';
  const selectedInput = document.getElementById(selectedInputId);
  selectedInput.value = selectedValues.join(', ');

  toggleDropdown(dropdownId);
}

function calculateTotals(filteredData) {
  let totalOrders = 0;
  let totalRevenue = 0;

  filteredData.forEach(item => {
    totalOrders++;
    totalRevenue += item.quantity * item.price;
  });

  document.getElementById('total-order').textContent = totalOrders;
  document.getElementById('total-revenue').textContent = totalRevenue;
}

function handleCategorySelect() {
  console.log('Filter category berfungsi');
  const selectedCategories = Array.from(document.querySelectorAll('#categoryDropdown input[type="checkbox"]:checked'))
    .map(checkbox => checkbox.value);

  const filters = {
    category: selectedCategories.includes('all') ? null : selectedCategories
  };

  fetchDataAndPrepareChart('datas.json', document.getElementById('myPieChart').getContext('2d'), 'total', filters);
}

function handleNameSelect() {
  console.log('Filter name berfungsi');
  const selectedNames = Array.from(document.querySelectorAll('#nameDropdown input[type="checkbox"]:checked'))
    .map(checkbox => checkbox.value);

  const filters = {
    name: selectedNames.includes('all') ? null : selectedNames
  };

  fetchDataAndPrepareChart('datas.json', document.getElementById('myPieChart').getContext('2d'), 'total', filters);
}

function handleDateSelect() {
  console.log('Filter date berfungsi');
  const selectedDates = Array.from(document.querySelectorAll('#dateDropdown input[type="checkbox"]:checked'))
    .map(checkbox => checkbox.value);

  const filters = {
    date: selectedDates.includes('all') ? null : selectedDates
  };

  fetchDataAndPrepareChart('datas.json', document.getElementById('myPieChart').getContext('2d'), 'total', filters);
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');
});

function fetchDataAndPrepareChart(url, ctx, chartType, filters = {}) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    })
    .then(jsonData => {
      const filteredData = jsonData.filter(item => {
        const matchesCategory = !filters.category || filters.category.includes(item.category);
        const matchesName = !filters.name || filters.name.includes(item.name);
        const matchesDate = !filters.date || filters.date.includes(item.date);
        return matchesCategory && matchesName && matchesDate;
      });

      if (filteredData.length === 0) {
        throw new Error('No data available for selected filters');
      }

      calculateTotals(filteredData);

      const chartData = updateChart(filteredData, chartType);
      if (chartType === 'pie') {
        createPieChart(chartData, ctx);
      } else if (chartType === 'doughnut') {
        createDoughnutChart(chartData, ctx);
      } else if (chartType === 'bar') {
        createBarChart(chartData, ctx);
      } else if (chartType === 'line') {
        createLineChart(chartData, ctx);
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error.message);
      // Provide feedback to the user about the error
      alert('Failed to fetch data. Please try again later.');
    });
  }

function updateChart(filteredData, chartType) {
  const groupedData = filteredData.reduce((acc, item) => {
    const key = chartType === 'total' ? item.quantity * item.price :
      chartType === 'month' ? moment(item.date).format('MMMM') :
      chartType === 'hour' ? parseInt(moment(item.time, "HH:mm:ss").format('HH'), 10) :
      chartType === 'week' ? getWeekOfMonth(item.date) :
      chartType === 'size' ? item.size :
      chartType === 'category' ? item.category : null;

    acc[key] = (acc[key] || 0) + (chartType === 'category' ? 1 : item.total);
    return acc;
  }, {});
  
  
    const labels = Object.keys(groupedData);
    const values =  Object.values(groupedData);
    const percentages = Object.values(groupedData).map(value => {
    const percentage = (values / values.reduce((acc, val) => acc + val, 0)) * 100;
    return percentage.toFixed(2) + '%';
  });
}

// Function to create charts of different types
function createPieChart(chartData, ctx) {
  createChart('pie', ctx, chartData.labels, chartData.values);
}

function createDoughnutChart(chartData, ctx) {
  createChart('doughnut', ctx, chartData.labels, chartData.values);
}

function createBarChart(chartData, ctx) {
  createChart('bar', ctx, chartData.labels, chartData.values);
}

function createLineChart(chartData, ctx) {
  createChart('line', ctx, chartData.labels, chartData.values);
}

// Function to create charts
function createChart(chartType, ctx, labels, values) {
  const chartData = {
    labels : labels.map((label, index) => `${label} (${percentages[index]}%)`),
    datasets: [{
      label: 'Data',
      data: values,
      backgroundColor: getChartColors(chartType),
      borderColor: getChartColors(chartType, true),
    }]
  };

  const chartConfig = {
    type: chartType,
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
            position: 'right',
        },
      },
      indexAxis: 'x',
      maintainAspectRatio: false,
      tooltips: {
          callbacks: {
              label: function (tooltipItem, data) {
                  const label = data.labels[tooltipItem.index] || '';
                  const value = data.datasets[0].data[tooltipItem.index] || '';
                  const percentage = percentages[tooltipItem.index] || '';
                  return `${label}: $${value} (${percentage})`;
              }
          }
      },
    }
  };

  new Chart(ctx, chartConfig);
}

// Function to generate color palettes for different chart types
function getChartColors(chartType, isBorder = false) {
  const colorPalettes = {
    pie: ['#f44336', '#9C27B0', '#3F51B5', '#03A9F4', '#4CAF50', '#FFEB3B'],
    doughnut: ['#f44336', '#9C27B0', '#3F51B5', '#03A9F4', '#4CAF50', '#FFEB3B'],
    bar: isBorder ? ['#f4433680', '#9C27B080', '#3F51B580', '#03A9F480', '#4CAF5080', '#FFEB3B80'] : ['#f44336', '#9C27B0', '#3F51B5', '#03A9F4', '#4CAF50', '#FFEB3B'],
    line: ['#f44336', '#9C27B0', '#3F51B5', '#03A9F4', '#4CAF50', '#FFEB3B'],
  };
  return colorPalettes[chartType] || ['#ccc']; // Default color if not found
}

// Function to calculate the week of the month
function getWeekOfMonth(date) {
  const givenDate = new Date(date);
  const weekInMonth = Math.floor((givenDate.getDate() - 1 + getFirstDayOfMonth(date)) / 7) + 1;
  return weekInMonth;
}

// Function to get the first day of the month
function getFirstDayOfMonth(date) {
  const givenDate = new Date(date);
  const year = givenDate.getFullYear();
  const month = givenDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  let firstWeekDay = firstDayOfMonth.getDay();
  // Adjust for Sunday starting the week
  if (firstWeekDay === 0) {
    firstWeekDay = 6;
  } else {
    firstWeekDay -= 1;
  }
  return firstWeekDay;
}

// Call fetchDataAndPrepareChart for each chart with appropriate arguments
document.addEventListener('DOMContentLoaded', function () {
  console.log('Data');
  fetchDataAndPrepareChart('datas.json', document.getElementById('myPieChart').getContext('2d'),'total', 'pie');
  fetchDataAndPrepareChart('datas.json', document.getElementById('PieChart').getContext('2d'),'size', 'doughnut');
  fetchDataAndPrepareChart('datas.json', document.getElementById('barChart').getContext('2d'), 'week', 'bar');
  fetchDataAndPrepareChart('datas.json', document.getElementById('barCharts').getContext('2d'), 'week', 'bar');
  fetchDataAndPrepareChart('datas.json', document.getElementById('lineChart').getContext('2d'), 'total', 'line');
  fetchDataAndPrepareChart('datas.json', document.getElementById('lineCharts').getContext('2d'), 'month', 'line');
  fetchDataAndPrepareChart('datas.json', document.getElementById('lineChartss').getContext('2d'), 'hour', 'line');
});