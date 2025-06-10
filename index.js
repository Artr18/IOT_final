import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  collection, getDocs, addDoc, 
  query, orderBy, limit 
} from "firebase/firestore";
import { db } from "./fire.js";

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

// Redireccionar "/" a "/dashboard"
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Dashboard - últimos 10 registros
app.get('/dashboard', async (req, res) => {
  try {
    const q = query(
      collection(db, 'valor'),
      orderBy('fecha', 'desc'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    const data = [];

    snapshot.forEach(doc => {
      const item = doc.data();

      // Convertir timestamp Firestore a ISO string si existe
      if (item.fecha && typeof item.fecha.toDate === 'function') {
        item.fecha = item.fecha.toDate().toISOString();
      } else if (item.fecha && item.fecha._seconds) {
        item.fecha = new Date(item.fecha._seconds * 1000).toISOString();
      }

      data.push(item);
    });

    res.render('dashboard', { data });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).send('Error al obtener datos');
  }
});

// Ruta para obtener datos para la gráfica (últimos 10 registros)
app.get('/grafica', async (req, res) => {
  try {
    const q = query(
      collection(db, 'valor'),
      orderBy('fecha', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    const wholeData = [];

    snapshot.forEach(doc => {
      const item = doc.data();
      if (item.fecha && typeof item.fecha.toDate === 'function') {
        item.fecha = item.fecha.toDate();
      }
      wholeData.push(item);
    });

    res.send(wholeData);
  } catch (error) {
    console.error('Error!', error);
    res.status(500).send('Error al obtener gráfica');
  }
});

// Insertar nuevo registro desde ESP32 u otro cliente
app.post('/insertar', async (req, res) => {
  try {
    const { BPM, SpO2, HR, nombre, fecha } = req.body;

    // Si se recibe fecha en texto, parsearla a Date. 
    // Asumimos que la fecha viene en ISO (ejemplo: "2025-06-09T22:21:31Z")
    const fechaObj = fecha ? new Date(fecha) : new Date();

    // Para asegurarnos que se guarde en UTC, Date ya almacena en UTC internamente.
    // No debemos hacer conversiones locales aquí.

    const docRef = await addDoc(collection(db, 'valor'), {
      BPM: Number(BPM),
      SpO2: Number(SpO2),
      HR: Number(HR),
      nombre,
      fecha: fechaObj
    });

    res.send({
      id: docRef.id,
      BPM: Number(BPM),
      SpO2: Number(SpO2),
      HR: Number(HR),
      nombre,
      fecha: fechaObj.toISOString() // UTC en formato ISO
    });
  } catch (error) {
    console.error('Error al insertar:', error);
    res.status(500).send('Error al insertar datos');
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
