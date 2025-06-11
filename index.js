import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// URL base del Realtime Database
const RTDB_URL = 'https://anafrec-d650e-default-rtdb.firebaseio.com/valor.json';

// Redirigir a dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Mostrar los últimos 10 registros
app.get('/dashboard', async (req, res) => {
  try {
    const response = await axios.get(RTDB_URL);
    const dataObject = response.data;

    const data = Object.values(dataObject || {}).reverse().slice(0, 10);

    res.render('dashboard', { data });
  } catch (error) {
    console.error('Error al obtener datos de RTDB:', error.message);
    res.status(500).send('Error al obtener datos');
  }
});

// Obtener datos para gráfica
app.get('/grafica', async (req, res) => {
  try {
    console.log('Solicitud a /grafica');
    const response = await axios.get(RTDB_URL);
    const dataObject = response.data;

    const data = Object.values(dataObject || {}).reverse().slice(0, 10);
    res.send(data);
  } catch (error) {
    console.error('Error al obtener gráfica:', error.message);
    res.status(500).send('Error al obtener datos');
  }
});


// Insertar nuevo registro (desde ESP32)
app.post('/insertar', async (req, res) => {
  try {
    const { BPM, SpO2, HR, nombre, fecha } = req.body;
    const fechaObj = fecha ? new Date(fecha) : new Date();

    const nuevoRegistro = {
      BPM: Number(BPM),
      SpO2: Number(SpO2),
      HR: Number(HR),
      nombre,
      fecha: fechaObj.toISOString()
    };

    await axios.post(RTDB_URL, nuevoRegistro);

    res.send(nuevoRegistro);
  } catch (error) {
    console.error('Error al insertar en RTDB:', error.message);
    res.status(500).send('Error al insertar datos');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
