const http = require('http');

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

const run = async () => {
  const mode = process.argv[2]; // 'create' or 'verify'

  if (mode === 'create') {
    const newProd = {
      name: 'Persistence Verification Widget',
      sku: 'PERSIST-TEST-100',
      category: 'Electronics',
      price: 1599,
      costPrice: 900,
      quantity: 25,
      minThreshold: 5,
      supplier: 'Durability Tech',
      description: 'Used to verify state persistence across server reboots',
    };

    const createRes = await request('/api/products', 'POST', newProd);
    console.log('CREATE PRODUCT STATUS:', createRes.status);
    console.log('PRODUCT CREATED:', createRes.body?.data?.sku, 'ID:', createRes.body?.data?._id || createRes.body?.data?.id);

    const prodId = createRes.body?.data?._id || createRes.body?.data?.id;

    // Record sale
    const saleRes = await request('/api/sales', 'POST', {
      items: [{ productId: prodId, quantity: 3 }],
      customerName: 'Persistence Auditor',
      paymentMethod: 'Credit Card',
      notes: 'Testing data integrity across reboot',
    });
    console.log('RECORD SALE STATUS:', saleRes.status);
    console.log('SALE RECORDED:', saleRes.body?.data?.saleNumber, 'Total:', saleRes.body?.data?.totalAmount);
    console.log('EXPECTED REMAINING STOCK: 22');
  } else if (mode === 'verify') {
    const productsRes = await request('/api/products');
    const matchedProduct = productsRes.body?.data?.find((p) => p.sku === 'PERSIST-TEST-100');
    console.log('PRODUCT FOUND AFTER RESTART?', Boolean(matchedProduct));
    if (matchedProduct) {
      console.log('PERSISTED PRODUCT NAME:', matchedProduct.name);
      console.log('PERSISTED PRODUCT STOCK:', matchedProduct.quantity, '(Matches expected 22?)', matchedProduct.quantity === 22);
    }

    const salesRes = await request('/api/sales');
    const matchedSale = salesRes.body?.data?.find((s) => s.customerName === 'Persistence Auditor');
    console.log('SALE FOUND AFTER RESTART?', Boolean(matchedSale));
    if (matchedSale) {
      console.log('PERSISTED SALE INVOICE:', matchedSale.saleNumber);
      console.log('PERSISTED SALE AMOUNT:', matchedSale.totalAmount);
    }

    // Clean up test product
    if (matchedProduct) {
      const id = matchedProduct._id || matchedProduct.id;
      const del = await request(`/api/products/${id}`, 'DELETE');
      console.log('CLEANUP STATUS:', del.status, del.body?.message);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
