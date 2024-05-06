



// const ctx = document.getElementById('myChart');

// fetch('datas.json')
//   .then(function (response) {
//     if (response.ok == true) {
//       return response.json()
//     }
//   })
//   .then(function (data) {
    
//     createChart(data, 'bar');
//   })


// function createChart(data, type) {
  // const labels = Object.keys(dataByDay);
  // const values = Object.values(dataByDay);
  // new Chart(ctx, {
  //   type: type,
  //   data: {
  //     labels: data.map(row=>row.dataByDay),
  //     datasets: [{
  //       label: '# of Votes',
  //       data: data.map(row =>row.dataByDay),
  //        backgroundColor: [
//             'rgba(255, 99, 132, 0.6)',
//             'rgba(54, 162, 235, 0.6)',
//             'rgba(255, 206, 86, 0.6)',
//             'rgba(75, 192, 192, 0.6)',
//             'rgba(153, 102, 255, 0.6)',
//             'rgba(255, 159, 64, 0.6)'
//     ],
//         borderWidth: 1
//       }]
//     },
//     options: {
//       scales: {
//         y: {
//           beginAtZero: true
//         }
//       }
//     }
//   });
// }



document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('myPieChart').getContext('2d');

    fetch('datas.json')
        .then(response => response.json())
        .then(jsonData => {
            // Ubah data JSON menjadi format yang lebih sederhana
            const simplifiedData = jsonData.map(item => ({
                date: moment(item.date).format('dddd'), // Mengubah tanggal menjadi hari
                total: item.quantity * item.price
            }));

            // Kelompokkan data berdasarkan hari dan hitung total per hari
            const dataByDay = simplifiedData.reduce((acc, item) => {
                const day = item.date;
                acc[day] = (acc[day] || 0) + item.total;
                return acc;
            }, {});

            const labels = Object.keys(dataByDay);
          const values = Object.values(dataByDay);
          
          const totalSum = values.reduce((acc, value) => acc + value, 0);
          const percentages = values.map(value => ((value / totalSum) * 100).toFixed(2));

            const chartData = {
                labels: labels.map((label,index) => `${label} (${percentages[index]}%)`),
                datasets: [{
                  // label: labels,
                  data: values,
                  backgroundColor: [
                        'rgb(165, 42, 42)',
                        'rgb(210, 105, 30)',
                        'rgb(251, 127, 80)',
                        'rgb(222, 184, 135)',
                        'rgb(255, 234, 208)',
                        'rgb(184, 134, 11)',
                        'rgb(189, 183, 107)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1
                }]
            };

            const options = {
              responsive: false,
               plugins: {
                  legend: {
                    position: 'right',
                 },
                },
                maintainAspectRatio: false,
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, data) => {
                            const dataset = data.datasets[tooltipItem.datasetIndex];
                            const currentValue = dataset.data[tooltipItem.index];
                            const percentage = ((currentValue / totalSum) * 100).toFixed(2);
                            return `${data.labels[tooltipItem.index]}: $${currentValue} (${percentage}%)`;
                            console.log(percentage);
                    }
                    }
              }
            };

            const myPieChart = new Chart(ctx, {
                type: 'pie',
                data: chartData,
                options: options
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});







