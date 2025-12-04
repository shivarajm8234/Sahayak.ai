const { chromium } = require('playwright');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase Config from client/src/lib/firebase.ts
const firebaseConfig = {
    apiKey: "AIzaSyCGEKMReYFb2V9jdLSP6UJE7wlgLxsiZEU",
    authDomain: "sahayak-ai-95c19.firebaseapp.com",
    projectId: "sahayak-ai-95c19",
    storageBucket: "sahayak-ai-95c19.firebasestorage.app",
    messagingSenderId: "789657630274",
    appId: "1:789657630274:android:c1c1894cba2946f3d71fdb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function scrapeSchemes() {
    console.log('Starting scrape...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // --- CONFIGURATION ---
    const TARGET_BANKS = {
        "public": ["State Bank of India", "SBI", "Punjab National Bank", "PNB", "Bank of Baroda", "BoB", "Canara", "Union Bank", "Bank of India"],
        "private": ["HDFC", "ICICI", "Axis", "Kotak", "IDFC"],
        "cooperative": ["Maharashtra State Cooperative", "Saraswat"]
    };

    const CATEGORIES = {
        "home": {
            "construction": ["construction", "plot", "land", "builder"],
            "renovation": ["renovation", "improvement", "repair", "decor", "extension", "furnish"],
            "regular": ["regular", "housing loan", "home loan", "privilege", "salary"]
        },
        "agriculture": {
            "crops": ["crop", "kisan", "kcc", "cultivation", "harvest", "short term", "production"],
            "machines": ["tractor", "machinery", "equipment", "harvester", "combine", "implement"],
            "livestock": ["dairy", "poultry", "livestock", "animal", "fishery", "sheep", "goat"],
            "land": ["land purchase", "farm land", "estate"]
        },
        "education": {
            "medical": ["medical", "mbbs", "doctor", "health", "nursing", "dental"],
            "undergrad": ["undergraduate", "bachelor", "ug", "college", "university"],
            "postgrad": ["postgraduate", "master", "mba", "pg", "higher education", "abroad", "foreign", "overseas"]
        }
    };

    function getBankType(bankName) {
        for (const [bType, names] of Object.entries(TARGET_BANKS)) {
            if (names.some(name => bankName.toLowerCase().includes(name.toLowerCase()))) {
                return bType;
            }
        }
        return "other";
    }

    function classifySubCategory(text, loanType) {
        text = text.toLowerCase();
        const specificCats = CATEGORIES[loanType] || {};
        for (const [subCat, keywords] of Object.entries(specificCats)) {
            if (keywords.some(k => text.includes(k))) {
                return subCat;
            }
        }
        return "general";
    }

    // URLs to scrape (subset from user request)
    const urls = [
        { type: 'agriculture', url: 'https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card' },
        { type: 'home', url: 'https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/home-loans-interest-rates-current' },
        { type: 'education', url: 'https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/education-loan-scheme' }
    ];

    for (const urlObj of urls) {
        try {
            console.log(`Scraping ${urlObj.url}...`);
            await page.goto(urlObj.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Simple text extraction for now, similar to the Python script's HTML parsing
            const content = await page.content();
            const title = await page.title();
            const textContent = await page.evaluate(() => document.body.innerText);

            // Extract potential interest rates (simple regex)
            const rateMatches = textContent.match(/\d+\.\d+\s?%/g);
            const interestRate = rateMatches ? [...new Set(rateMatches)].slice(0, 3).join(", ") : "Check details";

            const bankType = getBankType(title);
            const subCategory = classifySubCategory(textContent.substring(0, 1000), urlObj.type);

            const schemeData = {
                title: title.trim(),
                provider: bankType !== "other" ? bankType.toUpperCase() + " Bank" : "Unknown Bank",
                type: urlObj.type,
                subCategory: subCategory,
                interestRate: interestRate,
                url: urlObj.url,
                details: textContent.substring(0, 200).replace(/\s+/g, ' ').trim() + "...",
                lastScrapedAt: Date.now()
            };

            // Save to Firestore
            // Use a deterministic ID based on URL to avoid duplicates
            const docId = Buffer.from(urlObj.url).toString('base64').replace(/[=/+]/g, '');
            await setDoc(doc(db, 'schemes', docId), schemeData);

            console.log(`Saved scheme: ${schemeData.title}`);
        } catch (error) {
            console.error(`Failed to scrape ${urlObj.url}:`, error.message);
        }
    }

    await browser.close();
    console.log('Scrape complete.');
}

async function uploadRates() {
    const fs = require('fs');
    const path = require('path');

    const ratesPath = path.join(__dirname, '../rates.json');
    if (!fs.existsSync(ratesPath)) {
        console.error('rates.json not found. Run "npm run scrape:py" first.');
        return;
    }

    const rates = JSON.parse(fs.readFileSync(ratesPath, 'utf8'));
    console.log(`Found ${rates.length} schemes to upload.`);

    for (const rate of rates) {
        try {
            const schemeData = {
                title: `${rate.Bank} - ${rate['Sub-Category']}`,
                provider: rate.Bank,
                type: rate['Loan Category'].toLowerCase(),
                subCategory: rate['Sub-Category'].toLowerCase(),
                interestRate: rate['Interest Rate'],
                url: rate.Source,
                details: rate.Details,
                lastScrapedAt: Date.now()
            };

            // Use a deterministic ID based on URL to avoid duplicates
            const docId = Buffer.from(rate.Source).toString('base64').replace(/[=/+]/g, '');
            await setDoc(doc(db, 'schemes', docId), schemeData);
            console.log(`Uploaded: ${schemeData.title}`);
        } catch (error) {
            console.error(`Failed to upload ${rate.Bank}:`, error.message);
        }
    }
    console.log('Upload complete.');
}

function startServer() {
    const express = require('express');
    const cors = require('cors');
    const { spawn } = require('child_process');
    const path = require('path');

    const app = express();
    const port = 3001;

    app.use(cors());
    app.use(express.json());

    app.get('/api/scrape', (req, res) => {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        console.log(`Received scrape request for: ${query}`);

        // Use the virtual environment's python executable
        const pythonPath = path.join(__dirname, '../venv/bin/python3');
        const pythonProcess = spawn(pythonPath, ['scraper.py', query], {
            cwd: path.join(__dirname, '..')
        });

        let dataString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
            if (code !== 0) {
                return res.status(500).json({ error: 'Scraping failed' });
            }
            try {
                const results = JSON.parse(dataString);
                res.json(results);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                res.status(500).json({ error: 'Invalid response from scraper' });
            }
        });
    });

    app.listen(port, () => {
        console.log(`Scraper API listening at http://localhost:${port}`);
    });
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('upload')) {
        uploadRates().catch(console.error);
    } else if (args.includes('start-server')) {
        startServer();
    } else {
        scrapeSchemes().catch(console.error);
    }
}

module.exports = { scrapeSchemes, uploadRates, startServer };
