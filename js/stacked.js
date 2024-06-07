function fetchDataAndPrepareChart2(url, ctx, chartType, chartStyle, filterCategory = 'all', filterName = 'all', filterMonth = 'all') {
    fetch(url)
        .then(response => response.json())
        .then(jsonData => {
            const simplifiedData = jsonData.map(item => ({
                date: moment(item.date, 'YYYY-MM-DD').format('dddd'),
                month: moment(item.date, 'YYYY-MM-DD').format('MMMM'),
                hour: parseInt(moment(item.time, 'HH:mm:ss').format('HH'), 10),
                size: item.size,
                category: item.category,
                order: item.order_id,
                total: item.quantity * item.price,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                week: getWeekOfMonth(item.date)
            }));

            const uniqueCategories = getUniqueCategories(jsonData);
            updateFilters(jsonData, filterCategory, filterName, filterMonth);

            const filteredData = simplifiedData.filter(item => {
                const isCategoryMatch = filterCategory === "all" || item.category === filterCategory;
                const isNameMatch = filterName === "all" || item.name === filterName;
                const isMonthMatch = filterMonth === "all" || item.month === filterMonth;
                return isCategoryMatch && isNameMatch && isMonthMatch;
            });

            const groupedData = filteredData.reduce((acc, item) => {
                const week = item.week;
                if (!acc[week]) {
                    acc[week] = {};
                    uniqueCategories.forEach(category => {
                        acc[week][category] = 0;
                    });
                }
                acc[week][item.category] += item.total;
                return acc;
            }, {});

            const labels = Object.keys(groupedData).map(week => `Week ${week}`);
            const customBackgroundColors = [
                'rgb(226, 174, 19)',
                'rgb(208, 208, 15)',
                'rgb(254, 208, 73)',
                'rgb(238, 178, 59)',
                'rgb(212, 160, 15)',
                'rgb(184, 134, 11)',
                'rgb(189, 183, 107)',
            ];

            const datasets = uniqueCategories.map((category, index) => ({
                label: category,
                data: labels.map(label => {
                    const week = label.split(' ')[1];
                    return groupedData[week][category] || 0;
                }),
                backgroundColor: customBackgroundColors[index % customBackgroundColors.length],
                borderColor: customBackgroundColors[index % customBackgroundColors.length],
                borderWidth: 1
            }));

            const chartData = {
                labels: labels,
                datasets: datasets
            };

            const chartConfig = {
                type: chartStyle,
                data: chartData,
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Stacked Bar Chart by Week and Category'
                        },
                    },
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true
                        }
                    }
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

function fetchDataAndPrepareChart3(url, ctx, chartType, chartStyle, filterCategory = 'all', filterName = 'all', filterMonth = 'all') {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(jsonData => {
            const simplifiedData = jsonData.map(item => ({
                date: moment(item.date, 'YYYY-MM-DD').format('dddd'),
                month: moment(item.date, 'YYYY-MM-DD').format('MMMM'),
                hour: parseInt(moment(item.time, 'HH:mm:ss').format('HH'), 10),
                size: item.size,
                category: item.category,
                order: item.order_id,
                total: item.quantity * item.price,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                week: getWeekOfMonth(item.date)
            }));

            const uniqueCategories = getUniqueCategories(jsonData);
            updateFilters(jsonData, filterCategory, filterName, filterMonth);

            const filteredData = simplifiedData.filter(item => {
                const isCategoryMatch = filterCategory === "all" || item.category === filterCategory;
                const isNameMatch = filterName === "all" || item.name === filterName;
                const isMonthMatch = filterMonth === "all" || item.month === filterMonth;
                return isCategoryMatch && isNameMatch && isMonthMatch;
            });

            const groupedData = filteredData.reduce((acc, item) => {
                const week = item.week;
                const day = item.date;
                if (!acc[week]) {
                    acc[week] = {};
                }
                if (!acc[week][day]) {
                    acc[week][day] = 0;
                }
                acc[week][day] += item.total;
                return acc;
            }, {});

            const labels = Object.keys(groupedData).map(week => `Week ${week}`);
            const customBackgroundColors = [
                'rgb(226, 174, 19)',
                'rgb(208, 208, 15)',
                'rgb(254, 208, 73)',
                'rgb(238, 178, 59)',
                'rgb(212, 160, 15)',
                'rgb(184, 134, 11)',
                'rgb(189, 183, 107)',
            ];

            const datasets = Object.keys(groupedData).map(week => {
                return {
                    label: 'Day ' + week, // Menggunakan label sesuai dengan hari dalam seminggu
                    data: Object.keys(groupedData[week]).map(day => {
                        return groupedData[week][day];
                    }),
                    backgroundColor: customBackgroundColors[(week - 1) % customBackgroundColors.length],
                    borderColor: customBackgroundColors[(week - 1) % customBackgroundColors.length],
                    borderWidth: 1
                };
            });

            const chartData = {
                labels: labels,
                datasets: datasets
            };

            const chartConfig = {
                type: chartStyle,
                data: chartData,
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Stacked Bar Chart by Week and day'
                        },
                    },
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true
                        }
                    }
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
