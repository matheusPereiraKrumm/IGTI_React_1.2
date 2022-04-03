/*--------------------PREPARETION--------------------*/
getCountries().then((data) => loadCountries(data)).catch((err) => console.log(err));
let filterCountries = document.getElementById('cmbCountry');
let filterDateStart = document.getElementById('date_start');
let filterDateEnd = document.getElementById('date_end');
let filterData = document.getElementById('cmbData');
let btn = document.getElementById('filtro');
btn.addEventListener('click', actionFilter);

let labelConfirmed = document.getElementById('kpiconfirmed');
let labelDeath = document.getElementById('kpideaths');
let labelRecovered = document.getElementById('kpirecovered');

let countries = [];
getSummary().then((data) => {
    countries = data.Countries;
    printCountry();
}).catch((err) => console.log(err));


let lineCanvas = document.getElementById('linhas');
let lineChart = new Chart(lineCanvas, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: filterData.value,
                data: [],
                backgroundColor: ['rgb(255,255,0)']
            },
            {
                label: `Média de ${filterData.value}`,
                data: [],
                backgroundColor: ['rgb(255,0,0)']
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


/*--------------------METHOD--------------------*/
function loadCountries(paramCountries) {
    paramCountries.sort((a, b) => a.Slug.localeCompare(b.Slug)).forEach(c => {
        var option = document.createElement('option');
        option.value = c.Slug;
        option.innerHTML = c.Country;
        filterCountries.appendChild(option);
    });
    filterCountries.value = 'brazil';
}

function actionFilter() {
    if ((filterDateStart.value ?? '' != '') &&
        (filterDateEnd.value ?? '' != '')) {
        getDatas().then(printInfos).catch(console.error);
    } else {
        alert('Preencher Datas');
    }
}

function printInfos(history) {

    lineChart.data.datasets[0].label = filterData.value;
    lineChart.data.datasets[1].label = `Média de ${filterData.value}`;
    lineChart.data.labels = [];
    lineChart.data.datasets[0].data = [];
    lineChart.data.datasets[1].data = [];

    let cases = history.map(h => h.Cases);
    let totalCases = cases[cases.length - 1] - cases[0];
    let media = Math.trunc(totalCases / cases.length);

    history.forEach((h, i) => {
        if (i > 0) {
            lineChart.data.labels.push(h.Date.substring(0, 10))
            lineChart.data.datasets[0].data.push(h.Cases - history[i - 1].Cases);
            lineChart.data.datasets[1].data.push(media);
        }
    });
    lineChart.update();

    printCountry();
}

function printCountry() {
    let country = countries.find(c => c.Slug == filterCountries.value);
    var nf = Intl.NumberFormat();
    labelConfirmed.innerText = nf.format(country.TotalConfirmed);
    labelDeath.innerText = nf.format(country.TotalDeaths);
    labelRecovered.innerText = nf.format(country.TotalRecovered);
}

/*--------------------API--------------------*/
async function getCountries() {
    let summary = await axios.get('https://api.covid19api.com/countries');
    return summary.data;
}

async function getDatas() {
    let today = new Date();
    let endDate = today.toISOString().substring(0, 10);
    if (filterDateEnd.value.localeCompare(endDate) < 0) endDate = filterDateEnd.value;
    let startDate = new Date(filterDateStart.value);
    startDate.setDate(startDate.getDate() - 1);
    let data = await axios.get(`https://api.covid19api.com/country/${filterCountries.value}/status/${filterData.value}?from=${startDate.toISOString().substring(0, 10)}T00:00:00Z&to=${endDate}T00:00:00Z`);
    return data.data;
}

async function getSummary() {
    let summary = await axios.get('https://api.covid19api.com/summary');
    return summary.data;
}



