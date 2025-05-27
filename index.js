import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { db } from "./fire.js";
import { 
  collection, getDocs, addDoc, 
  query, orderBy, limit 
} from "firebase/firestore";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send(
    '<h1>API Express & Firebase MonitoreO2</h1><ul>' +
    '<li><p><b>GET /ver</b></p></li>' +
    '<li><p><b>GET /valor</b></p></li>' +
    '<li><p><b>GET /estado</b></p></li>' +
    '<li><p><b>POST /insertar</b>  => {BPM, SpO2, HR}</p></li>' +
    '<li><p><b>POST /encender</b></p></li>' +
    '<li><p><b>POST /apagar</b></p></li>' +
    '<li><p>GET /grafica</p></li>' +
    '</ul>'
  );
});

app.get('/ver', async (req, res) => {
  try {
    const q = query(collection(db, 'Valores'), orderBy('fecha', 'asc'));
    const snapshot = await getDocs(q);
    const wholeData = [];
    snapshot.forEach(doc => wholeData.push(doc.data()));
    console.log(wholeData);
    res.send(wholeData);
  } catch (error) {
    console.error('Error!', error);
    res.status(500).send('Error al obtener datos');
  }
});

app.get('/estado', async (req, res) => {
  try {
    const q = query(collection(db, 'Rele'), orderBy('fecha', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    const wholeData = [];
    snapshot.forEach(doc => wholeData.push(doc.data()));
    console.log(wholeData);
    res.send(wholeData);
  } catch (error) {
    console.error('Error!', error);
    res.status(500).send('Error al obtener estado');
  }
});

app.get('/estados', async (req, res) => {
  try {
    const q = query(collection(db, 'Rele'), orderBy('fecha', 'asc'));
    const snapshot = await getDocs(q);
    const wholeData = [];
    snapshot.forEach(doc => wholeData.push(doc.data()));
    console.log(wholeData);
    res.send(wholeData);
  } catch (error) {
    console.error('Error!', error);
    res.status(500).send('Error al obtener estados');
  }
});

app.get('/valor', async (req, res) => {
  try {
    const q = query(collection(db, 'Valores'), orderBy('fecha', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    const wholeData = [];
    snapshot.forEach(doc => wholeData.push(doc.data()));
    console.log(wholeData);
    res.send(wholeData);
  } catch (error) {
    console.error('Error!', error);
    res.status(500).send('Error al obtener valor');
  }
});

app.get('/grafica', async (req, res) => {
  try {
    const q = query(collection(db, 'Valores'), orderBy('fecha', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    const wholeData = [];
    snapshot.forEach(doc => wholeData.push(doc.data()));
    console.log(wholeData);
    res.send(wholeData);
  } catch (error) {
    console.error('Error!', error);
    res.status(500).send('Error al obtener gráfica');
  }
});

app.post('/insertar', async (req, res) => {
  try {
    const docRef = await addDoc(collection(db, 'Valores'), {
      BPM: Number(req.body.BPM),
      SpO2: Number(req.body.SpO2),
      HR: Number(req.body.HR),
      nombre: req.body.nombre,
      fecha: new Date()
    });

    res.send({
      id: docRef.id,
      BPM: Number(req.body.BPM),
      SpO2: Number(req.body.SpO2),
      HR: Number(req.body.HR),
      nombre: req.body.nombre,
      fecha: new Date(),
      status: 'Valores insertados!'
    });
  } catch (error) {
    console.error('Error al insertar:', error);
    res.status(500).send('Error al insertar datos');
  }
});

app.post('/encender', async (req, res) => {
  try {
    const docRef = await addDoc(collection(db, 'Rele'), {
      r1: true,
      nombre: req.body.nombre,
      fecha: new Date()
    });

    res.send({
      id: docRef.id,
      r1: true,
      nombre: req.body.nombre,
      fecha: new Date(),
      status: 'Rele encendido'
    });
  } catch (error) {
    console.error('Error al encender:', error);
    res.status(500).send('Error al encender');
  }
});

app.post('/apagar', async (req, res) => {
  try {
    const docRef = await addDoc(collection(db, 'Rele'), {
      r1: false,
      nombre: req.body.nombre,
      fecha: new Date()
    });

    res.send({
      id: docRef.id,
      r1: false,
      nombre: req.body.nombre,
      fecha: new Date(),
      status: 'Rele apagado'
    });
  } catch (error) {
    console.error('Error al apagar:', error);
    res.status(500).send('Error al apagar');
  }
});

app.listen(PORT, () => {
  console.log(`Escuchando en puerto ${PORT}`);
});
