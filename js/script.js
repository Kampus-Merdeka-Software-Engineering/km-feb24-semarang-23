function displayLastUpdatedDate() {
    const footer = document.getElementById('footer');
    const lastUpdated = document.lastModified;
    footer.innerText = `Last Updated: ${new Date(lastUpdated).toLocaleDateString()}`;

}

function getUniqueCategories(jsonData) {
  const uniqueCategories = new Set();
  for (const item of jsonData) {
    uniqueCategories.add(item.category);
  }
  return Array.from(uniqueCategories);
}
// unique name of pizza
function getUniqueNamePizza(jsonData) {
  const UniqueNamePizza = new Set();
  for (const item of jsonData) {
    UniqueNamePizza.add(item.name);
  }
  return Array.from(UniqueNamePizza);
}
// unique name of pizza
function getUniqueMonth(jsonData) {
  const UniqueMonth = new Set();
  for (const item of jsonData) {
    UniqueMonth.add(moment(item.date,'YYYY-MM-DD').format('MMMM'));
  }
  return Array.from(UniqueMonth);
}

// Function to populate a filter element with options
    function populateFilterElement(elementId, values, selectedValue) {
      const filterElement = document.getElementById(elementId);
      filterElement.innerHTML = ""; // Clear existing options

      const allOption = document.createElement("option");
      allOption.value = "all";
      allOption.text = "All";
      if (selectedValue === "all") {
        allOption.selected = true;
      }
      filterElement.appendChild(allOption);

      for (const value of values) {
        const option = document.createElement("option");
        option.value = value;
        option.text = value;
        if (selectedValue === value) {
          option.selected = true;
        }
        filterElement.appendChild(option);
      }
    }
function updateFilters(jsonData,filterCategory, filterName, filterMonth) {
  const uniqueCategories = getUniqueCategories(jsonData);
  const uniqueNamePizza = getUniqueNamePizza(jsonData);
  const uniqueMonth = getUniqueMonth(jsonData);
  populateFilterElement("categoryFilter", uniqueCategories, "all");
  populateFilterElement("nameFilter", uniqueNamePizza, "all");
  populateFilterElement("monthFilter", uniqueMonth, "all");
    
// Update total order dan total revenue berdasarkan filter yang diterapkan
    const filteredData = jsonData.filter(item => {
        const isCategoryMatch = filterCategory === "all" || item.category === filterCategory;
        const isNameMatch = filterName === "all" || item.name === filterName;
        const isMonthMatch = filterMonth === "all" || moment(item.date,'YYYY-MM-DD').format('MMMM') === filterMonth;
        return isCategoryMatch && isNameMatch && isMonthMatch;
    });
    // console.log('Filtered Data:', filteredData);

    const result = filteredData.reduce((acc, item) => {
        const revenue = item.quantity * item.price;
        acc.totalRevenue += revenue;
        if (item.order_id !== undefined) {
            acc.totalOrders += 1;
        }
        return acc;
    }, {totalRevenue: 0, totalOrders: 0});

    const roundedRevenue = Math.floor(result.totalRevenue);
    const roundedOrders = Math.floor(result.totalOrders);

    const rev = document.getElementById('total-revenue');
    const ord = document.getElementById('total-order');

    // Tampilkan total revenue dan total order ke dalam elemen HTML
    rev.innerText = `$${roundedRevenue.toLocaleString()}`;
    ord.innerText = `${roundedOrders.toLocaleString()}`;
}

let myCharts = {};
let lastSelectedCategory = 'all';
let lastSelectedName = 'all';
let lastSelectedMonth = 'all';

// Fungsi untuk melakukan fetch data dan menyiapkan data chart
function fetchDataAndPrepareChart1(url, ctx, chartType, chartStyle, filterCategory = 'all', filterName = 'all', filterMonth = 'all') {
    // console.log(`Filter values - Category: ${filterCategory}, Name: ${filterName}, Month: ${filterMonth}`);

    const rev = document.getElementById('total-revenue');
    const ord = document.getElementById('total-order');
    
    fetch(url)
        .then(response => response.json())
        .then(jsonData => {
            // Convert JSON data into a simpler format
            const simplifiedData = jsonData.map(item => ({
                date: moment(item.date, 'YYYY-MM-DD').format('dddd'), // Convert date to day
                month: moment(item.date, 'YYYY-MM-DD').format('MMMM'),
                hour: parseInt(moment(item.time, 'HH:mm:ss').format('HH'), 10),
                size: item.size,
                category: item.category,
                order: item.order_id,
                total: item.quantity * item.price,
                quantity: item.quantity,
                price: item.price,
                name: item.name
            }));
            
            const uniqueCategories = getUniqueCategories(jsonData);
            const uniqueNamePizza = getUniqueNamePizza(jsonData);
            const uniqueMonth = getUniqueMonth(jsonData);
            updateFilters(jsonData, filterCategory, filterName, filterMonth);

            // console.log(uniqueMonth);

            const filteredData = simplifiedData.filter(item => {
                const isCategoryMatch = filterCategory === "all" || item.category === filterCategory;
                const isNameMatch = filterName === "all" || item.name === filterName;
                const isMonthMatch = filterMonth === "all" || item.month === filterMonth;
                return isCategoryMatch && isNameMatch && isMonthMatch;
            });

            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];
            function getDayIndex(dayName) {
                return daysOfWeek.indexOf(dayName);
            }

            filteredData.sort((a, b) => {
                const dateA = getDayIndex(a.date);
                const dateB = getDayIndex(b.date);
                return dateA - dateB;
            });
            
            // Mengurutkan data berdasarkan bulan
            simplifiedData.sort((a, b) => {
                const monthA = parseInt(a.month, 10);
                const monthB = parseInt(b.month, 10);
                return monthA - monthB;
            });
           
            // group data and calculate total revenue per size
            const groupedData = filteredData.reduce((acc, item) => {
                if (chartType === 'total') {
                    const day = item.date;
                    acc[day] = (acc[day] || 0) + item.total;
                } else if (chartType === 'month') {
                    const month = item.month;
                    acc[month] = (acc[month] || 0);
                    acc[month] = (acc[month] || 0) + item.total;
                } else if (chartType === 'hour') {
                    const hour = item.hour;
                    acc[hour] = (acc[hour] || 0);
                    acc[hour] = (acc[hour] || 0) + item.total;
                } else if (chartType === 'size') {
                    const size = item.size;
                    acc[size] = acc[size] || 0;
                    acc[size] += item.total;
                } else if (chartType === 'category') {
                    const category = item.category;
                    acc[category] = (acc[category] || 0);
                    acc[category]++;
                }
                return acc;
            }, {});

            // console.log('Grouped Data:', groupedData);

            const labels = Object.keys(groupedData);
            const values = Object.values(groupedData);
            const percentages = Object.values(groupedData).map(value => {
                const percentage = (value / values.reduce((acc, val) => acc + val, 0)) * 100;
                return percentage.toFixed(2) + '%';
            });
            // Array of custom background colors
            const customBackgroundColors = [
                'rgb(226, 174, 19)',
                'rgb(208, 208, 15)',
                'rgb(254, 208, 73)',
                'rgb(238, 178, 59)',
                'rgb(212, 160, 15)',
                'rgb(184, 134, 11)',
                'rgb(189, 183, 107)',
            ];
            // Use custom background colors for chart
            const backgroundColors = customBackgroundColors.slice(0, labels.length);
            const chartData = {
                labels: labels.map((label, index) => `${label} (${percentages[index]}%)`),
                datasets: [{
                    // label: chartType === 'total' ? 'total revenue' : 'revenue per size',
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors, // Use the same color for border
                    borderWidth: 1
                }]
            };
            
            const chartConfig = {
                type: chartStyle, // Tipe chart (pie atau doughnut)
                data: chartData,
                options: {
                    responsive: false,
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
            if (myCharts[ctx.canvas.id]) {
                myCharts[ctx.canvas.id].destroy();
            }

            myCharts[ctx.canvas.id] = new Chart(ctx, chartConfig);
            displayLastUpdatedDate();

            lastSelectedCategory = filterCategory;
            const categoryFilter = document.getElementById('categoryFilter');
            categoryFilter.value = lastSelectedCategory;
            
            lastSelectedName = filterName;
            const nameFilter = document.getElementById('nameFilter');
            nameFilter.value = lastSelectedName;
            // console.log(nameFilter.value);

            lastSelectedMonth = filterMonth;
            const monthFilter = document.getElementById('monthFilter');
            monthFilter.value = lastSelectedMonth;

        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
        
}

function getWeekOfMonth(date) {
    const givenDate = new Date(date);
    const weekInMonth = Math.floor((givenDate.getDate() - 1 + getFirstDayOfMonth(date)) / 7) + 1;
    return weekInMonth;
}

function getFirstDayOfMonth(date) {
    const givenDate = new Date(date);
    const year = givenDate.getFullYear();
    const month = givenDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    let firstWeekDay = firstDayOfMonth.getDay();
    if (firstWeekDay === 0) {
        firstWeekDay = 6;
    } else {
        firstWeekDay -= 1;
    }
    return firstWeekDay;
}

// Menggunakan fungsi fetchDataAndPrepareChart untuk membuat chart
document.addEventListener('DOMContentLoaded', () => {
    const ctx1 = document.getElementById('weekChart').getContext('2d');

    fetchDataAndPrepareChart1('datas.json', ctx1, 'total', 'pie',lastSelectedCategory,lastSelectedName,lastSelectedMonth);
    
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];
    

    filters.forEach(filterId => {
        const filterElement = document.getElementById(filterId);
        filterElement.addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
            
            fetchDataAndPrepareChart1('datas.json', ctx1, 'total', 'pie', selectedCategory, actFilterName, actFilterMonth);
        });
       
    });
    const categoryFilter = document.getElementById('categoryFilter');
    const nameFilter = document.getElementById('nameFilter');
    const monthFilter = document.getElementById('monthFilter');
    categoryFilter.value = lastSelectedCategory;
    nameFilter.value = lastSelectedName;
    monthFilter.value = lastSelectedMonth;
});
document.addEventListener('DOMContentLoaded', () => {
    const ctx2 = document.getElementById('sizeChart').getContext('2d');

    fetchDataAndPrepareChart1('datas.json', ctx2, 'size', 'doughnut',lastSelectedCategory,lastSelectedName,lastSelectedMonth);
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart1('datas.json', ctx2, 'size', 'doughnut', selectedCategory, actFilterName, actFilterMonth);
            
        });
    });
    const categoryFilter = document.getElementById('categoryFilter');
    const nameFilter = document.getElementById('nameFilter');
    const monthFilter = document.getElementById('monthFilter');
    categoryFilter.value = lastSelectedCategory;
    nameFilter.value = lastSelectedName;
    monthFilter.value = lastSelectedMonth;
});

document.addEventListener('DOMContentLoaded', () => {
    const ctx3 = document.getElementById('dayChart').getContext('2d');

    fetchDataAndPrepareChart2('datas.json', ctx3, 'category', 'bar',lastSelectedCategory,lastSelectedName,lastSelectedMonth);
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart2('datas.json', ctx3, 'category', 'bar', selectedCategory, actFilterName, actFilterMonth);
            
        });
    });
    const categoryFilter = document.getElementById('categoryFilter');
    const nameFilter = document.getElementById('nameFilter');
    const monthFilter = document.getElementById('monthFilter');
    categoryFilter.value = lastSelectedCategory;
    nameFilter.value = lastSelectedName;
    monthFilter.value = lastSelectedMonth;
});

document.addEventListener('DOMContentLoaded', () => {
    const ctx4 = document.getElementById('monthChart').getContext('2d');

    fetchDataAndPrepareChart3('datas.json', ctx4, 'day', 'bar',lastSelectedCategory,lastSelectedName,lastSelectedMonth);
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart3('datas.json', ctx4, 'day', 'bar', selectedCategory, actFilterName, actFilterMonth);
            
        });
    });
    const categoryFilter = document.getElementById('categoryFilter');
    const nameFilter = document.getElementById('nameFilter');
    const monthFilter = document.getElementById('monthFilter');
    categoryFilter.value = lastSelectedCategory;
    nameFilter.value = lastSelectedName;
    monthFilter.value = lastSelectedMonth;
});

document.addEventListener('DOMContentLoaded', () => {
    const ctx5 = document.getElementById('timeChart1').getContext('2d');

    fetchDataAndPrepareChart1('datas.json', ctx5, 'month', 'line',lastSelectedCategory,lastSelectedName,lastSelectedMonth);
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart1('datas.json', ctx5, 'month', 'line', selectedCategory, actFilterName, actFilterMonth);
            
        });
    });
    const categoryFilter = document.getElementById('categoryFilter');
    const nameFilter = document.getElementById('nameFilter');
    const monthFilter = document.getElementById('monthFilter');
    categoryFilter.value = lastSelectedCategory;
    nameFilter.value = lastSelectedName;
    monthFilter.value = lastSelectedMonth;
});

document.addEventListener('DOMContentLoaded', () => {
    const ctx6 = document.getElementById('timeChart2').getContext('2d');

    fetchDataAndPrepareChart1('datas.json', ctx6, 'total', 'line',lastSelectedCategory,lastSelectedName,lastSelectedMonth);
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart1('datas.json', ctx6, 'total', 'line', selectedCategory, actFilterName, actFilterMonth);
            
        });
    });
    const categoryFilter = document.getElementById('categoryFilter');
    const nameFilter = document.getElementById('nameFilter');
    const monthFilter = document.getElementById('monthFilter');
    categoryFilter.value = lastSelectedCategory;
    nameFilter.value = lastSelectedName;
    monthFilter.value = lastSelectedMonth;
});

document.addEventListener('DOMContentLoaded', () => {
    const ctx7 = document.getElementById('timeChart3').getContext('2d');

    fetchDataAndPrepareChart1('datas.json', ctx7, 'hour', 'line',lastSelectedCategory,lastSelectedName,lastSelectedMonth);
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart1('datas.json', ctx7, 'total', 'line', selectedCategory, actFilterName, actFilterMonth);
            
        });
    });
    const categoryFilter = document.getElementById('categoryFilter');
    const nameFilter = document.getElementById('nameFilter');
    const monthFilter = document.getElementById('monthFilter');
    categoryFilter.value = lastSelectedCategory;
    nameFilter.value = lastSelectedName;
    monthFilter.value = lastSelectedMonth;
});

