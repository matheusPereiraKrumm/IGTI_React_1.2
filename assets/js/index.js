/*--------------------PREPARETION--------------------*/
getSummary().then((data) => initializeData(data)).catch((err) => console.log(err));

let labelConfirmed = document.getElementById('confirmed');
let labelDeath = document.getElementById('death');
let labelRecovered = document.getElementById('recovered');
let labelDate = document.getElementById('date');

let pizzaCanvas = document.getElementById('pizza');
let pizzaChart = new Chart(pizzaCanvas, {
    type: 'pie',
    data: {
        labels: ['Novos Confirmados', 'Novas Mortes', 'Novos Recuperados'],
        datasets: [
            {
                data: [],
                backgroundColor: ['rgb(0,0,255)', 'rgb(255,0,0)', 'rgb(0,255,0)']
            }
        ],
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Distribuição de novos casos' }
        }
    }
});

let top10Canvas = document.getElementById('barras');
let top10Chart = new Chart(top10Canvas, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Mortes',
                data: [],
                backgroundColor: ['rgb(255,0,255)']
            }
        ],
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Total de Mortes por país - Top 10' }
        }
    }
});

/*--------------------METHOD--------------------*/
function initializeData(summary) {
    printTotalInfo(summary.Global);
    printNewsInfo(summary.Global);
    printTop10Deaths(summary.Countries);
}

function printTotalInfo(summaryGlobal) {
    labelConfirmed.innerText = summaryGlobal.TotalConfirmed;
    labelDeath.innerText = summaryGlobal.TotalDeaths;
    labelRecovered.innerText = summaryGlobal.TotalRecovered;
    labelDate.innerText = `Data de atualização: ${summaryGlobal.Date}`;
}

function printNewsInfo(summaryGlobal) {
    pizzaChart.data.datasets[0].data.push(summaryGlobal.NewConfirmed);
    pizzaChart.data.datasets[0].data.push(summaryGlobal.NewDeaths);
    pizzaChart.data.datasets[0].data.push(summaryGlobal.NewRecovered);
    pizzaChart.update()
}

function printTop10Deaths(contries) {
    let contriesOrdened = contries.sort((c1, c2) => c2.TotalDeaths - c1.TotalDeaths);
    for (let i = 0; i < 10; i++) {
        top10Chart.data.labels.push(contriesOrdened[i].Country);
        top10Chart.data.datasets[0].data.push(contriesOrdened[i].TotalDeaths);
    }
    top10Chart.update()
}
/*--------------------API--------------------*/
async function getSummary() {
    let summary = await axios.get('https://api.covid19api.com/summary');
    return summary.data;
}