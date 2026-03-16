const customerForm = document.getElementById('customerForm');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');

// Save or Update
customerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        id: document.getElementById('customerId').value || null,
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        measurements: {
            chest: document.getElementById('chest').value,
            waist: document.getElementById('waist').value,
            length: document.getElementById('length').value,
        },
        orders: [document.getElementById('orderNotes').value]
    };

    await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    alert('Saved successfully!');
    resetForm();
});

// Search
searchInput.addEventListener('input', async (e) => {
    const res = await fetch(`/api/customers?query=${e.target.value}`);
    const customers = await res.json();
    
    resultsDiv.innerHTML = customers.map(c => `
        <div class="customer-card">
            <div>
                <strong>${c.name}</strong> (${c.phone})<br>
                <small>Chest: ${c.measurements.chest || '--'}</small>
            </div>
            <button onclick="editCustomer('${c.id}')">Edit / History</button>
        </div>
    `).join('');
});

// Edit logic (simple version)
async function editCustomer(id) {
    const res = await fetch(`/api/customers?query=`); // Get all
    const customers = await res.json();
    const customer = customers.find(c => c.id === id);

    document.getElementById('customerId').value = customer.id;
    document.getElementById('name').value = customer.name;
    document.getElementById('phone').value = customer.phone;
    document.getElementById('chest').value = customer.measurements.chest;
    document.getElementById('waist').value = customer.measurements.waist;
    document.getElementById('length').value = customer.measurements.length;
    document.getElementById('orderNotes').value = customer.orders.join('\n');
    document.getElementById('form-title').innerText = "Edit Customer Details";
}

function resetForm() {
    customerForm.reset();
    document.getElementById('customerId').value = '';
    document.getElementById('form-title').innerText = "Add New Customer";
}

// Function to clear the results area and highlight the active button
function setActiveNav(buttonId) {
    document.querySelectorAll('.side-nav a').forEach(btn => btn.classList.remove('active'));
    document.getElementById(buttonId).classList.add('active');
    resultsDiv.innerHTML = ''; // Clear the results area for the new view
}

// 1. Dashboard / New Order Button (Shows the main form)
document.getElementById('navDashboard').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav('navDashboard');
    // This simply clears the search results so you see your main form clearly
});

document.getElementById('navNewOrder').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav('navNewOrder');
    resetForm(); // Clears any old data in the inputs
});

// 2. Customer List Button
document.getElementById('navCustomerList').addEventListener('click', async (e) => {
    e.preventDefault();
    setActiveNav('navCustomerList');
    
    const res = await fetch('/api/customers?query='); 
    const customers = await res.json();
    
    if (customers.length === 0) {
        resultsDiv.innerHTML = '<p style="padding: 20px;">No customers found yet.</p>';
        return;
    }

    resultsDiv.innerHTML = customers.map(c => `
        <div class="customer-card">
            <div>
                <strong>${c.name}</strong> (${c.phone})<br>
                <small>Chest: ${c.measurements.chest || '--'} | Waist: ${c.measurements.waist || '--'}</small>
            </div>
            <button class="btn-secondary" onclick="editCustomer('${c.id}')">View/Edit</button>
        </div>
    `).join('');
});

// 3. Analytics Button (Placeholder logic)
document.getElementById('navAnalytics').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav('navAnalytics');
    resultsDiv.innerHTML = `
        <div style="padding: 20px;">
            <h3>Business Analytics</h3>
            <p>Total Orders this month: Coming Soon</p>
            <p>Top Fabric Choice: Silk/Cotton Mix</p>
        </div>`;
});

// 4. Settings Button (Placeholder logic)
document.getElementById('navSettings').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav('navSettings');
    resultsDiv.innerHTML = `
        <div style="padding: 20px;">
            <h3>System Settings</h3>
            <p>Shop Name: TailorPro Premium</p>
            <p>Currency: PKR</p>
            <button class="btn-primary" onclick="alert('Settings Saved!')">Save Changes</button>
        </div>`;
});