var jsonData = null;
var categoryNames = [];
var namePizza = [];
var monthNames = [];
var dayNames = [];
var sizeNames = [];
var timeNames = [];
var myDayChart = null;
var myMonthChart = null;
var myTimeChart = null;
var myWeekChart = null;
var mySizeChart = null;

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

function fetchDataAndInit() {
    fetch('datas.json')
        .then(response => response.json())
        .then(data => {
            const simplifiedData = data.map(item => {
                return {
                    date: item.date,
                    time: item.time,
                    day: moment(item.date).format('dddd'),
                    month: moment(item.date).format('MMMM'),
                    size: item.size,
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    price: item.price,
                    revenue: item.price * item.quantity,
                    hour: parseInt(moment(item.time, "HH:mm:ss").format('HH'), 10),
                    week: getWeekOfMonth(item.date),
                };
            });

            categoryNames = [...new Set(data.map(item => item.category))];
            namePizza = [...new Set(data.map(item => item.name))];
            monthNames = [...new Set(data.map(item => moment(item.date).format('MMMM')))];
            dayNames = [...new Set(data.map(item => moment(item.date).format('dddd')))].sort((a, b) => moment().day(a).day() - moment().day(b).day());
            sizeNames = [...new Set(data.map(item => item.size))];
            weekNames = [...new Set(data.map(item => getWeekOfMonth(item.date)))];
            timeNames = [...new Set(data.map(item => parseInt(moment(item.time, "HH:mm:ss").format('HH'), 10)))].sort((a, b) => a - b);


            jsonData = simplifiedData;
            filterData('category');
            filterData('name');
            filterData('month');
        })
        .catch(error => console.error('Error fetching data:', error));
}

fetchDataAndInit();

function toggleDropdown(dropdownId) {
    var dropdownContent = document.getElementById(dropdownId);
    dropdownContent.classList.toggle("show");

    if (dropdownId === 'categoryDropdown') {
        filterData('category');
    } else if (dropdownId === 'nameDropdown') {
        filterData('name');
    } else if (dropdownId === 'monthDropdown') {
        filterData('month');
    }
}

function filterData(type) {
    var checkboxes, checkedValues;

    var totalRevenue = 0;
    var totalOrders = 0; // Tambahkan inisialisasi totalOrders

    if (type === 'category') {
        checkboxes = document.querySelectorAll('.categoryCheckbox:checked');
        checkedValues = Array.from(checkboxes).map(checkbox => checkbox.value);
    } else if (type === 'name') {
        checkboxes = document.querySelectorAll('.nameCheckbox:checked');
        checkedValues = Array.from(checkboxes).map(checkbox => checkbox.value);
    } else if (type === 'month') {
        checkboxes = document.querySelectorAll('.monthCheckbox:checked');
        checkedValues = Array.from(checkboxes).map(checkbox => checkbox.value);
    }
    
    var weekOrders = Array(dayNames.length).fill(0);
    var sizeRevenue = Array(sizeNames.length).fill(0);
    var monthRevenue = Array(monthNames.length).fill(0);
    var timeRevenue = Array(timeNames.length).fill(0);

    jsonData.forEach(item => {
        if (type === 'category') {
            if (checkedValues.length === 0 || checkedValues.includes(item.category)) {
                var dayIndex = moment(item.date).day(); // Get the day of the week (0-6)
                weekOrders[dayIndex] += parseInt(item.revenue);
                var sizeIndex = sizeNames.indexOf(item.size); // Get the index of the size
                sizeRevenue[sizeIndex] += parseInt(item.revenue);
                var monthIndex = moment(item.date).month(); // Get the day of the week (0-6)
                monthRevenue[monthIndex] += parseInt(item.revenue);
                var timeIndex = moment(item.time).hour(); // Get the day of the week (0-6)
                timeRevenue[timeIndex] += parseInt(item.revenue);
                totalRevenue += parseInt(item.revenue); // Tambahkan pendapatan ke totalRevenue
                totalOrders++; // Tambahkan satu pesanan ke totalOrders
            }
        } else if (type === 'name') {
            if (checkedValues.length === 0 || checkedValues.includes(item.name)) {
                var dayIndex = moment(item.date).day(); // Get the day of the week (0-6)
                weekOrders[dayIndex] += parseInt(item.revenue);
                var sizeIndex = sizeNames.indexOf(item.size); // Get the index of the size
                sizeRevenue[sizeIndex] += parseInt(item.revenue);
                var monthIndex = moment(item.date).month(); // Get the day of the week (0-6)
                monthRevenue[monthIndex] += parseInt(item.revenue);
                var timeIndex = moment(item.time).hour(); // Get the day of the week (0-6)
                timeRevenue[timeIndex] += parseInt(item.revenue);
                totalRevenue += parseInt(item.revenue); // Tambahkan pendapatan ke totalRevenue
                totalOrders++; // Tambahkan satu pesanan ke totalOrders
            }
        } else if (type === 'month') {
            if (checkedValues.length === 0 || checkedValues.includes(moment(item.date).format('MMMM'))) {
                var dayIndex = moment(item.date).day(); // Get the day of the week (0-6)
                weekOrders[dayIndex] += parseInt(item.revenue);
                var sizeIndex = sizeNames.indexOf(item.size); // Get the index of the size
                sizeRevenue[sizeIndex] += parseInt(item.revenue);
                var monthIndex = moment(item.date).month(); // Get the day of the week (0-6)
                monthRevenue[monthIndex] += parseInt(item.revenue);
                var timeIndex = moment(item.time).hour(); // Get the day of the week (0-6)
                timeRevenue[timeIndex] += parseInt(item.revenue);
                totalRevenue += parseInt(item.revenue); // Tambahkan pendapatan ke totalRevenue
                totalOrders++; // Tambahkan satu pesanan ke totalOrders
            }
        }
    });

    console.log("Checked Values:", checkedValues); // Tambahkan ini untuk memeriksa nilai checked values
    console.log("Total Revenue:", totalRevenue); // Tambahkan ini untuk memeriksa total revenue
    console.log("Total Orders:", totalOrders); // Tambahkan ini untuk memeriksa total orders
    console.log("Week Orders:", weekOrders); // Tambahkan ini untuk memeriksa week orders
    console.log("Size Revenue:", sizeRevenue); // Tambahkan ini untuk memeriksa size revenue
    console.log("Month Revenue:", monthRevenue); // Tambahkan ini untuk memeriksa month revenue
    console.log("Time Revenue:", timeRevenue); // Tambahkan ini untuk memeriksa time revenue

    document.getElementById('total-revenue').textContent = totalRevenue; // Tampilkan total pendapatan
    document.getElementById('total-order').textContent = totalOrders; // Tampilkan total pesanan

    updateWeekChart(weekOrders);
    updateSizeChart(sizeRevenue);
    updateDayChart(weekOrders);
    updateMonthChart(monthRevenue);
    updateTimeChart(timeRevenue);
}

function updateWeekChart(weekOrders) {
    if (myWeekChart !== null) {
        myWeekChart.destroy();
    }

    // Hitung total revenue
    const totalRevenue = weekOrders.reduce((acc, val) => acc + val, 0);

    // Hitung persentase untuk setiap hari
    const percentages = weekOrders.map(value => {
        const percentage = (value / totalRevenue) * 100;
        return percentage.toFixed(2) + '%';
    });

    const customBackgroundColors = [
        'rgb(165, 42, 42)',
        'rgb(210, 105, 30)',
        'rgb(251, 127, 80)',
        'rgb(222, 184, 135)',
        'rgb(255, 234, 208)',
        'rgb(184, 134, 11)',
        'rgb(189, 183, 107)',
    ];

    const backgroundColors = customBackgroundColors.slice(0, dayNames.length);

    var ctx1 = document.getElementById('weekChart').getContext('2d');
    myWeekChart = new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: dayNames.map((name, index) => `${name} (${percentages[index]}%)`),
            datasets: [{
                label: 'Total Revenue',
                data: weekOrders,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            const percentage = percentages[context.dataIndex];
                            return `${label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    });
}

function updateSizeChart(sizeRevenue) {
    if (mySizeChart !== null) {
        mySizeChart.destroy();
    }

    // Hitung total revenue
    const totalRevenue = sizeRevenue.reduce((acc, val) => acc + val, 0);

    // Hitung persentase untuk setiap hari
    const percentages = sizeRevenue.map(value => {
        const percentage = (value / totalRevenue) * 100;
        return percentage.toFixed(2) + '%';
    });

    const customBackgroundColors = [
        'rgb(165, 42, 42)',
        'rgb(210, 105, 30)',
        'rgb(251, 127, 80)',
        'rgb(222, 184, 135)',
        'rgb(255, 234, 208)',
        'rgb(184, 134, 11)',
        'rgb(189, 183, 107)',
    ];

    const backgroundColors = customBackgroundColors.slice(0, sizeNames.length);

    var ctx2 = document.getElementById('sizeChart').getContext('2d');
    mySizeChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: sizeNames.map((name, index) => `${name} (${percentages[index]}%)`),
            datasets: [{
                label: 'Total Revenue',
                data: sizeRevenue,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            const percentage = percentages[context.dataIndex];
                            return `${label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    });
}

function updateDayChart(weekOrders) {
    if (myDayChart !== null) {
        myDayChart.destroy();
    }

    // Hitung total revenue
    const totalRevenue = weekOrders.reduce((acc, val) => acc + val, 0);

    // Hitung persentase untuk setiap hari
    const percentages = weekOrders.map(value => {
        const percentage = (value / totalRevenue) * 100;
        return percentage.toFixed(2) + '%';
    });

    const customBackgroundColors = [
        'rgb(165, 42, 42)',
        'rgb(210, 105, 30)',
        'rgb(251, 127, 80)',
        'rgb(222, 184, 135)',
        'rgb(255, 234, 208)',
        'rgb(184, 134, 11)',
        'rgb(189, 183, 107)',
    ];

    const backgroundColors = customBackgroundColors.slice(0, dayNames.length);

    var ctx3 = document.getElementById('dayChart').getContext('2d');
    myDayChart = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: dayNames.map((name, index) => `${name} (${percentages[index]}%)`),
            datasets: [{
                label: 'Total Revenue',
                data: weekOrders,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            const percentage = percentages[context.dataIndex];
                            return `${label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    });
}

function updateMonthChart(monthRevenue) {
    if (myMonthChart !== null) {
        myMonthChart.destroy();
    }

    // Hitung total revenue
    const totalRevenue = monthRevenue.reduce((acc, val) => acc + val, 0);

    // Hitung persentase untuk setiap hari
    const percentages = monthRevenue.map(value => {
        const percentage = (value / totalRevenue) * 100;
        return percentage.toFixed(2) + '%';
    });

    const customBackgroundColors = [
        'rgb(165, 42, 42)',
        'rgb(210, 105, 30)',
        'rgb(251, 127, 80)',
        'rgb(222, 184, 135)',
        'rgb(255, 234, 208)',
        'rgb(184, 134, 11)',
        'rgb(189, 183, 107)',
    ];

    const backgroundColors = customBackgroundColors.slice(0, monthNames.length);

    var ctx4 = document.getElementById('monthChart').getContext('2d');
    myMonthChart = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: monthNames.map((name, index) => `${name} (${percentages[index]}%)`),
            datasets: [{
                label: 'Total Revenue',
                data: monthRevenue,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            const percentage = percentages[context.dataIndex];
                            return `${label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    });
}

function updateTimeChart(timeRevenue) {
    if (myTimeChart !== null) {
        myTimeChart.destroy();
    }

    const totalRevenue = timeRevenue.reduce((acc, val) => acc + val, 0);
    const percentages = timeRevenue.map(value => {
        const percentage = totalRevenue === 0 ? 0 : (value / totalRevenue) * 100;
        return percentage.toFixed(2) + '%';
    });

    const customBackgroundColors = [
        'rgb(165, 42, 42)',
        'rgb(210, 105, 30)',
        'rgb(251, 127, 80)',
        'rgb(222, 184, 135)',
        'rgb(255, 234, 208)',
        'rgb(184, 134, 11)',
        'rgb(189, 183, 107)',
        'rgb(139, 69, 19)',
        'rgb(218, 165, 32)',
        'rgb(205, 92, 92)',
        'rgb(255, 228, 181)',
        'rgb(160, 82, 45)',
        'rgb(244, 164, 96)',
        'rgb(210, 180, 140)',
        'rgb(205, 133, 63)',
        'rgb(139, 69, 19)',
        'rgb(160, 82, 45)',
        'rgb(222, 184, 135)',
        'rgb(255, 228, 181)',
        'rgb(205, 133, 63)',
        'rgb(139, 69, 19)',
        'rgb(160, 82, 45)',
        'rgb(222, 184, 135)',
        'rgb(255, 228, 181)'
    ];

    const backgroundColors = customBackgroundColors.slice(0, 24);

    var ctx5 = document.getElementById('timeChart').getContext('2d');
    myTimeChart = new Chart(ctx5, {
        type: 'bar',
        data: {
            labels: timeNames.map((name, index) => `${name} (${percentages[index]}%)`),
            datasets: [{
                label: 'Total Revenue',
                data: timeRevenue,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            const percentage = percentages[context.dataIndex];
                            return `${label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    });
}

window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};
