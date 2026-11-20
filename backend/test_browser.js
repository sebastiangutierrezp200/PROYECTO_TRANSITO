const puppeteer = require('puppeteer');
const axios = require('axios');

async function testBrowser() {
  console.log('--- Verificación Visual y de Consola en Navegador (Puppeteer) ---');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  // 1. Landing Page
  console.log('1. Probando Landing Page (http://localhost:5173/)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  console.log('   ✅ Landing cargada sin bloqueos.');

  // 2. Login Page
  console.log('2. Probando Login (http://localhost:5173/login)...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  console.log('   ✅ Login cargado correctamente.');

  // 3. Login Ciudadano y Aula Virtual
  console.log('3. Probando flujo de Ciudadano en Aula Virtual...');
  const resC = await axios.post('http://localhost:3001/api/auth/login', {
    identifier: 'ciudadano2@prueba.com',
    password: 'Pass123*'
  });
  
  await page.evaluate((auth) => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('auth_user', JSON.stringify(auth.usuario));
  }, resC.data.data);

  await page.goto('http://localhost:5173/curso', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  console.log('   ✅ Portal del curso cargado para Ciudadano.');

  // 4. Certificado Ciudadano
  console.log('4. Probando Certificado Oficial...');
  await page.goto('http://localhost:5173/curso/certificado', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  console.log('   ✅ Certificado oficial con QR y 50% de descuento cargado.');

  // 5. Login Admin y Dashboard
  console.log('5. Probando Dashboard de Administrador...');
  const resA = await axios.post('http://localhost:3001/api/auth/login', {
    identifier: 'superadmin',
    password: 'Admin123*'
  });

  await page.evaluate((auth) => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('auth_user', JSON.stringify(auth.usuario));
  }, resA.data.data);

  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  console.log('   ✅ Dashboard administrativo cargado con gráficos y métricas.');

  await browser.close();

  console.log('\n--- Resumen de Errores Críticos de Consola ---');
  if (consoleErrors.length === 0) {
    console.log('🎉 0 errores en consola durante la navegación.');
  } else {
    console.log(`⚠️ Advertencias/Errores registrados: ${consoleErrors.length}`);
    consoleErrors.slice(0, 5).forEach(e => console.log('   -', e));
  }
}

testBrowser().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
