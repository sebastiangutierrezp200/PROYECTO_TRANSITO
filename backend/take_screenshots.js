const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OUT_DIR = path.resolve(__dirname, '..', 'capturas');
const BRAIN_DIR = 'C:\\Users\\sebas\\.gemini\\antigravity\\brain\\96f25bf2-fd4c-4a1d-b09b-a39df4763d5d';

async function getAuthToken(identifier, password) {
  const res = await axios.post('http://localhost:3001/api/auth/login', {
    identifier,
    password
  });
  return res.data.data;
}

async function run() {
  console.log('Iniciando captura con Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Pantalla Inicial con la invitación ("¿Quieres hacer tu curso virtual?")
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('Capturando Pantalla 1: Inicio e Invitación al Curso Virtual...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  const file1 = path.join(OUT_DIR, '1_pantalla_inicial_invitacion_curso.png');
  await page.screenshot({ path: file1, fullPage: false });
  console.log('Guardada:', file1);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Formulario de registro / inicio de sesión
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('Capturando Pantalla 2: Formulario de Inicio de Sesión / Registro...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  // Type in the form fields to make it look active and functional
  try {
    const inputUser = await page.$('input[type="text"]');
    if (inputUser) await inputUser.type('ciudadano1@prueba.com', { delay: 30 });
    const inputPass = await page.$('input[type="password"]');
    if (inputPass) await inputPass.type('Pass123*', { delay: 30 });
  } catch (e) {
    console.log('Typing note:', e.message);
  }
  await new Promise(r => setTimeout(r, 800));
  const file2 = path.join(OUT_DIR, '2_formulario_inicio_sesion.png');
  await page.screenshot({ path: file2, fullPage: false });
  console.log('Guardada:', file2);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. El chatbot haciendo las preguntas de selección múltiple o escrita
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('Capturando Pantalla 3: Chatbot interactivo con preguntas...');
  const auth1 = await getAuthToken('ciudadano1@prueba.com', 'Pass123*');
  
  await page.evaluate((auth) => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('auth_user', JSON.stringify(auth.usuario));
  }, auth1);

  await page.goto('http://localhost:5173/curso/leccion/1', { waitUntil: 'networkidle2' });
  // Wait for the AI chatbot to sequence and show the questions
  console.log('Esperando secuenciador de IA en la lección...');
  await new Promise(r => setTimeout(r, 4500));
  const file3 = path.join(OUT_DIR, '3_chatbot_preguntas_leccion.png');
  await page.screenshot({ path: file3, fullPage: false });
  console.log('Guardada:', file3);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Pantalla final con el porcentaje de aprobación y certificado con QR de 50%
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('Capturando Pantalla 4: Certificado de Aprobación con QR y 50% Descuento...');
  const auth2 = await getAuthToken('ciudadano2@prueba.com', 'Pass123*');
  
  await page.evaluate((auth) => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('auth_user', JSON.stringify(auth.usuario));
  }, auth2);

  await page.goto('http://localhost:5173/curso/certificado', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));
  const file4 = path.join(OUT_DIR, '4_certificado_aprobacion_qr_descuento.png');
  await page.screenshot({ path: file4, fullPage: true });
  console.log('Guardada:', file4);

  await browser.close();
  console.log('¡Todas las capturas se completaron con éxito!');

  // Copy to brain artifacts directory
  if (fs.existsSync(BRAIN_DIR)) {
    const files = [
      '1_pantalla_inicial_invitacion_curso.png',
      '2_formulario_inicio_sesion.png',
      '3_chatbot_preguntas_leccion.png',
      '4_certificado_aprobacion_qr_descuento.png'
    ];
    for (const f of files) {
      const src = path.join(OUT_DIR, f);
      const dest = path.join(BRAIN_DIR, f);
      fs.copyFileSync(src, dest);
      console.log('Copia a brain completada:', dest);
    }
  }
}

run().catch(err => {
  console.error('Error durante la captura:', err);
  process.exit(1);
});
