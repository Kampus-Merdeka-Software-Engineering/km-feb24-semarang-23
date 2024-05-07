function displayLastUpdatedDate() {
  const footer = document.getElementById('footer');
  const lastUpdated = document.lastModified;
  footer.innerText = `Last Updated: ${new Date(lastUpdated).toLocaleDateString()}`;
}



function categoryFunc() {
    document.getElementById('category').classList.toggle('show');
}


window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName('dropdown-content');
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Fungsi untuk melakukan fetch data dan menyiapkan data chart
function fetchDataAndPrepareChart(url, ctx, chartType, chartStyle) {
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
                order:item.order_id,
                total: item.quantity * item.price,
                quantity: item.quantity,
                price: item.price
                
            }));

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

            // filter data based on chartType
            const filteredData = simplifiedData.filter(item => {
                if (chartType === 'total') {
                    return true;
                } else if (chartType === 'month') {
                    return true;
                }else if (chartType === 'hour') {
                    return true;
                }else if (chartType === 'size') {
                    return true;
                }else if (chartType === 'category') {
                    return true;
                }
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

            // Panggil fungsi untuk membuat chart
            new Chart(ctx, chartConfig);
            displayLastUpdatedDate();

        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// document.addEventListener('DOMContentLoaded', () => {
//   const rev = document.getElementById('total-revenue');
//   const ord = document.getElementById('total-order');

//   fetch('datas.json')
//     .then(response => response.json())
//       .then(data => {
//           // Hitung total sum(quantity * price) menggunakan fungsi reduce
//           const result = data.reduce((acc, item) => {
//               const revenue = item.quantity * item.price;
//               acc.totalRevenue += revenue;
//               if (item.order_id !== undefined) {
//                   acc.ord += 1;
//               }
//             //   acc.ord += 1;
//               return acc;
//           }, {totalRevenue:0,ord:0});
//         const roundedRevenue = Math.floor(result.totalRevenue);
//     //   const roundedOrder = Math.floor(totalRevenue);

//       // Tampilkan total revenue ke dalam elemen HTML
//       rev.innerText = `$${roundedRevenue.toLocaleString()}`;
//       ord.innerText = `${result.ord.toLocaleString()}`;
//     })
//     .catch(error => console.error('Error reading JSON file:', error));
// });


// Menggunakan fungsi fetchDataAndPrepareChart untuk membuat chart
document.addEventListener('DOMContentLoaded', () => {
    const ctx1 = document.getElementById('myPieChart').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx1,'total','pie');
});
document.addEventListener('DOMContentLoaded', () => {
    const ctx1 = document.getElementById('PieChart').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx1,'size','doughnut');
});
document.addEventListener('DOMContentLoaded', () => {
    const ctx2 = document.getElementById('barChart').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx2,'category','bar');
});

document.addEventListener('DOMContentLoaded', () => {
    const ctx2 = document.getElementById('barCharts').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx2,'total','bar');
});

document.addEventListener('DOMContentLoaded', () => {
    const ctx3 = document.getElementById('lineChart').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx3,'total','line');
});

document.addEventListener('DOMContentLoaded', () => {
    const ctx3 = document.getElementById('lineCharts').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx3,'month','line');
});
document.addEventListener('DOMContentLoaded', () => {
    const ctx3 = document.getElementById('lineChartss').getContext('2d');

    fetchDataAndPrepareChart('datas.json', ctx3,'hour','line');
});





