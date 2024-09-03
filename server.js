const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

async function scrapeEarthquakeData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.potresi.hr/');
    await page.waitForSelector('#earthquakestableeu');

    const tableData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#earthquakestableeu tbody tr'));

        return rows.map(row => {
            const columns = row.querySelectorAll('td');
            return {
                region: columns[0].textContent.trim(),
                magnitude: columns[1].textContent.trim(),
                date: columns[2].textContent.trim(),
                time: columns[3].textContent.trim(),
                depth: columns[4].textContent.trim(),
                latitude: columns[5].textContent.trim(),
                longitude: columns[6].textContent.trim(),
            };
        });
    });

    await browser.close();
    return tableData;
}

// Endpoint to get earthquake data
app.get('/earthquake-data', async (req, res) => {
    try {
        const data = await scrapeEarthquakeData();
        res.json(data);
    } catch (error) {
        console.error('Error scraping data:', error);
        res.status(500).send('Error scraping data');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
