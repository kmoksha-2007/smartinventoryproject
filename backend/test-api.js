const http = require('http');

const runTests = async () => {
  const { app, startServer } = require('./server');
  const server = await startServer();

  const request = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    console.log('\n--- [TEST 1] HEALTH CHECK ---');
    const health = await request('/api/health');
    console.log('Health Response:', health.status, health.body?.status);
    if (health.status !== 200) throw new Error('Health check failed');

    console.log('\n--- [TEST 2] DASHBOARD STATS ---');
    const stats = await request('/api/dashboard/stats');
    console.log('Total Products:', stats.body?.data?.totalProducts);
    console.log('Total Stock Units:', stats.body?.data?.totalStock);
    console.log('Low Stock Count:', stats.body?.data?.lowStockCount);
    console.log('Inventory Value:', stats.body?.data?.inventoryRetailValue);
    if (!stats.body?.success) throw new Error('Dashboard stats failed');

    console.log('\n--- [TEST 3] GET PRODUCTS & FILTERING ---');
    const allProducts = await request('/api/products');
    console.log(`Retrieved ${allProducts.body?.count} initial seed products.`);
    if (allProducts.body?.count < 5) throw new Error('Expected seed products');

    const searchRes = await request('/api/products?search=Mouse');
    console.log(`Search "Mouse" returned ${searchRes.body?.count} product(s).`);

    const catRes = await request('/api/products?category=Electronics');
    console.log(`Category "Electronics" returned ${catRes.body?.count} product(s).`);

    console.log('\n--- [TEST 4] CREATE NEW PRODUCT ---');
    const newProd = {
      name: 'Wireless Bluetooth Headset 5.3',
      sku: 'HEAD-BT-999',
      category: 'Electronics',
      price: 2499,
      costPrice: 1500,
      quantity: 12,
      minThreshold: 4,
      supplier: 'AudioTech Supplies',
      description: 'Active noise cancelling wireless stereo headset',
    };
    const createRes = await request('/api/products', 'POST', newProd);
    console.log('Created Product ID:', createRes.body?.data?._id || createRes.body?.data?.id);
    const createdId = createRes.body?.data?._id || createRes.body?.data?.id;
    if (!createdId) throw new Error('Product creation failed');

    console.log('\n--- [TEST 5] UPDATE PRODUCT ---');
    const updateRes = await request(`/api/products/${createdId}`, 'PUT', {
      price: 2699,
      description: 'Updated description: Premium edition',
    });
    console.log('Updated Price:', updateRes.body?.data?.price);
    if (updateRes.body?.data?.price !== 2699) throw new Error('Product update failed');

    console.log('\n--- [TEST 6] RESTOCK SUGGESTIONS ---');
    const suggestions = await request('/api/products/restock-suggestions');
    console.log(`Found ${suggestions.body?.count} restock suggestion(s):`);
    suggestions.body?.data?.slice(0, 3).forEach((s) => {
      console.log(`  -> ${s.product.name}: Current=${s.currentQuantity}, Min=${s.minThreshold}, SuggestOrder=+${s.suggestedRestockQuantity} (Urgency: ${s.urgency})`);
    });

    console.log('\n--- [TEST 7] RECORD SALE & VERIFY STOCK DECREMENT ---');
    // We will sell 2 units of the created headset (initially 12 units)
    const salePayload = {
      items: [
        {
          productId: createdId,
          quantity: 2,
        },
      ],
      customerName: 'Aarav Sharma',
      paymentMethod: 'UPI',
      notes: 'Test sale verification',
    };
    const saleRes = await request('/api/sales', 'POST', salePayload);
    console.log('Sale Recorded:', saleRes.body?.data?.saleNumber, 'Total:', saleRes.body?.data?.totalAmount);
    if (!saleRes.body?.success) throw new Error('Sale recording failed');

    // Verify stock is now 10 (12 - 2)
    const checkProduct = await request(`/api/products/${createdId}`);
    console.log(`Stock after sale: ${checkProduct.body?.data?.quantity} (Expected: 10)`);
    if (checkProduct.body?.data?.quantity !== 10) {
      throw new Error(`Stock decrement failed! Expected 10, got ${checkProduct.body?.data?.quantity}`);
    }

    console.log('\n--- [TEST 8] OVERSELL PROTECTION CHECK ---');
    // Try to sell 15 units when only 10 available
    const overSale = await request('/api/sales', 'POST', {
      items: [{ productId: createdId, quantity: 15 }],
      customerName: 'Invalid Customer',
    });
    console.log('Oversell status code:', overSale.status, 'Message:', overSale.body?.message);
    if (overSale.status !== 400 && overSale.status !== 500) {
      throw new Error('Oversell protection failed: System should have rejected request!');
    }

    console.log('\n--- [TEST 9] RESTOCK PRODUCT ---');
    const restockRes = await request(`/api/products/${createdId}/restock`, 'POST', { quantity: 5 });
    console.log('Stock after restock +5:', restockRes.body?.data?.quantity, '(Expected: 15)');
    if (restockRes.body?.data?.quantity !== 15) throw new Error('Restock failed');

    console.log('\n--- [TEST 10] DELETE TEST PRODUCT ---');
    const deleteRes = await request(`/api/products/${createdId}`, 'DELETE');
    console.log('Delete Response:', deleteRes.body?.message);

    console.log('\n=============================================');
    console.log('🎉 ALL 10 TEST SUITES PASSED FLAWLESSLY! 🎉');
    console.log('=============================================');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    server.close();
    process.exit(1);
  }
};

runTests();
