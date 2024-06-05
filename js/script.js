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
    UniqueMonth.add(moment(item.date).format('MMMM'));
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
function updateFilters(jsonData) {
  const uniqueCategories = getUniqueCategories(jsonData);
  const uniqueNamePizza = getUniqueNamePizza(jsonData);
  const uniqueMonth = getUniqueMonth(jsonData);
  populateFilterElement("categoryFilter", uniqueCategories, "all");
  populateFilterElement("nameFilter", uniqueNamePizza, "all");
  populateFilterElement("monthFilter", uniqueMonth, "all");
}

let myCharts={};

// Fungsi untuk melakukan fetch data dan menyiapkan data chart
function fetchDataAndPrepareChart(url, ctx, chartType, chartStyle, filterCategory = 'all', filterName = 'all', filterMonth = 'all') {
    // console.log(`Filter values - Category: ${filterCategory}, Name: ${filterName}, Month: ${filterMonth}`);

    const rev = document.getElementById('total-revenue');
    const ord = document.getElementById('total-order');
    
    fetch(url)
        .then(response => response.json())
        .then(jsonData => {
            // Convert JSON data into a simpler format
            const simplifiedData = jsonData.map(item => ({
                date: moment(item.date).format('dddd'), // Convert date to day
                month: moment(item.date).format('MMMM'),
                hour: parseInt(moment(item.time, "HH:mm:ss").format('HH'), 10),
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
            updateFilters(jsonData);
            // console.log(uniqueMonth);

            const filteredData=simplifiedData.filter(item => {
                const isCategoryMatch = filterCategory === "all" || item.category === filterCategory;
                const isNameMatch = filterName === "all" || item.name === filterName;
                const isMonthMatch = filterMonth === "all" || moment(item.date).format('MMMM') === filterMonth;
                return isCategoryMatch && isNameMatch && isMonthMatch;
            });

            // console.log('Filtered data:', filteredData);

            const result = jsonData.reduce((acc, item) => {
              const revenue = item.quantity * item.price;
              acc.totalRevenue += revenue;
              if (item.order_id !== undefined) {
                  acc.ord += 1;
              }
            //   acc.ord += 1;
              return acc;
          }, {totalRevenue:0,ord:0});
            const roundedRevenue = Math.floor(result.totalRevenue);
            //   const roundedOrder = Math.floor(totalRevenue);

            // Tampilkan total revenue ke dalam elemen HTML
            rev.innerText = `$${roundedRevenue.toLocaleString()}`;
            ord.innerText = `${result.ord.toLocaleString()}`;

             // Buat array untuk nama hari dalam bahasa Inggris
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const monthsInEnglish = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            // Fungsi untuk memetakan nama hari ke nomor urutan hari dalam seminggu
            function getDayIndex(dayName) {
                return daysOfWeek.indexOf(dayName);
            }
            function getMonthIndex(monthName) {
                return monthsInEnglish.indexOf(monthName);
            }
            // Mengurutkan data berdasarkan hari 
            simplifiedData.sort((a, b) => {
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
                }else if (chartType === 'month') {
                    const month = item.month;
                    acc[month] = (acc[month] || 0);
                    acc[month] = (acc[month] || 0) + item.total;
                }else if (chartType === 'hour') {
                    const hour = item.hour;
                    acc[hour] = (acc[hour] || 0);
                    acc[hour] = (acc[hour] || 0) + item.total;
                }else if (chartType === 'size') {
                    const size = item.size;
                    acc[size] = acc[size] || 0;
                    acc[size] += item.total;
                } else if(chartType ==='category'){
                    const category = item.category;
                    acc[category] = (acc[category] || 0);
                    acc[category]++;
                }
                return acc;
            }, {});

            const labels = Object.keys(groupedData);
            const values = Object.values(groupedData);
            const percentages = Object.values(groupedData).map(value => {
                const percentage = (value / values.reduce((acc, val) => acc + val, 0)) * 100;
                return percentage.toFixed(2) + '%';
            });
            // Array of custom background colors
            const customBackgroundColors = [
                'rgb(165, 42, 42)',
                'rgb(210, 105, 30)',
                'rgb(251, 127, 80)',
                'rgb(222, 184, 135)',
                'rgb(255, 234, 208)',
                'rgb(184, 134, 11)',
                'rgb(189, 183, 107)',
            ];
            // Use custom background colors for chart
            const backgroundColors = customBackgroundColors.slice(0, labels.length);
            const chartData = {
                labels:labels.map((label,index) => `${label} (${percentages[index]}%)`) ,
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
                    indexAxis:'x',
                    maintainAspectRatio: false,
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
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

        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Menggunakan fungsi fetchDataAndPrepareChart untuk membuat chart
document.addEventListener('DOMContentLoaded', () => {
    const ctx1 = document.getElementById('weekChart').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx1, 'total', 'pie');
    
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];
    

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart('datas.json', ctx1,'total','pie', selectedCategory, actFilterName,actFilterMonth);
        });
    })
});
document.addEventListener('DOMContentLoaded', () => {
    const ctx2 = document.getElementById('sizeChart').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx2, 'size', 'doughnut');
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart('datas.json', ctx2, 'size', 'doughnut', selectedCategory, actFilterName,actFilterMonth);
        });
    })
});
document.addEventListener('DOMContentLoaded', () => {
    const ctx3 = document.getElementById('dayChart').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx3, 'category', 'bar');
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart('datas.json', ctx3, 'category', 'bar', selectedCategory, actFilterName,actFilterMonth);
        });
    })
});

document.addEventListener('DOMContentLoaded', () => {
    const ctx4 = document.getElementById('monthChart').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx4, 'total', 'bar');
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart('datas.json', ctx4, 'total', 'bar', selectedCategory, actFilterName,actFilterMonth);
        });
    })
});

document.addEventListener('DOMContentLoaded', () => {
    const ctx5 = document.getElementById('timeChart').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx5, 'total', 'line');
    const filters = ['categoryFilter', 'nameFilter', 'monthFilter'];

    filters.forEach(filterId => {

        document.getElementById(filterId).addEventListener('change', () => {
            const selectedCategory = document.getElementById('categoryFilter').value;
            const actFilterName = document.getElementById('nameFilter').value;
            const actFilterMonth = document.getElementById('monthFilter').value;
    
            fetchDataAndPrepareChart('datas.json', ctx5, 'total', 'line', selectedCategory, actFilterName,actFilterMonth);
        });
    })
});



