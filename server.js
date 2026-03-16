const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
//cd "OneDrive\Pictures\Documents\Tailor-system\TailorPro-Project"

// Middleware
app.use(express.json());

// Serves files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

/**
 * FIX 1: Dynamic File Path
 * Uses '/tmp/data.json' for Vercel deployment and 'data.json' for local Windows dev.
 */
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const DATA_FILE = isVercel 
    ? '/tmp/data.json' 
    : path.join(__dirname, 'data.json');

// Helper to read JSON safely
const getData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const initialData = { customers: [] };
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(fileContent);
    } catch (err) {
        console.error("Error reading data file:", err);
        return { customers: [] };
    }
};

// Helper to write JSON
const saveData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error saving data file:", err);
    }
};

// --- ROUTES ---

// Add or Update Customer
app.post('/api/customers', (req, res) => {
    const data = getData();
    const { id, name, phone, measurements, orders } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ success: false, message: "Name and Phone are required" });
    }

    /**
     * FIX 2: Type-safe ID comparison
     * IDs in data.json are strings. This ensures we match them correctly.
     */
    if (id) {
        const index = data.customers.findIndex(c => c.id.toString() === id.toString());
        if (index !== -1) {
            data.customers[index] = { 
                ...data.customers[index], 
                measurements: measurements || data.customers[index].measurements, 
                orders: orders || data.customers[index].orders 
            };
            console.log(`✅ Updated: ${name}`);
        }
    } else {
        const newCustomer = {
            id: Date.now().toString(),
            name,
            phone,
            measurements: measurements || {},
            orders: orders || []
        };
        data.customers.push(newCustomer);
        console.log(`✨ New Customer Added: ${name}`);
    }
    
    saveData(data);
    res.json({ success: true });
});

// Search Customers
app.get('/api/customers', (req, res) => {
    const { query } = req.query;
    const data = getData();
    
    /**
     * FIX 3: Empty query handling
     * Prevents the server from crashing if search is empty.
     */
    if (!query) {
        return res.json(data.customers);
    }

    const filtered = data.customers.filter(c => 
        (c.name && c.name.toLowerCase().includes(query.toLowerCase())) || 
        (c.phone && c.phone.includes(query))
    );
    res.json(filtered);
});

app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`🚀 TailorPro Server Running!`);
    console.log(`🔗 Local Access: http://localhost:${PORT}`);
    console.log(`📂 Saving data to: ${DATA_FILE}`);
    console.log(`-------------------------------------------`);
});