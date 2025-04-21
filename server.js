const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
mongoose.set("strictQuery", false);
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = 3000;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://fc59877:GF5ewMTfjxZuFMJT@projetodb.vbcnre5.mongodb.net/?retryWrites=true&w=majority&appName=Filial');
}

const MoradaSchema = new mongoose.Schema({
  id: Number,
  rua: String,
  numeroDaPorta: Number,
  codigoPostal: String,
  localidade: String,
}, { timestamps: true });

const TaxiSchema = new mongoose.Schema({
  matricula: String,
  anoDeCompra: Number,
  marca: { type: String, enum: ['Honda', 'Ford', 'Chevrolet', 'Toyota'], required: true },
  modelo: { type: String, enum: ['Civic', 'Accord', 'Jazz', 'Focus', 'Fiesta', 'Mustang', 'Cruze', 'Camaro', 'Spark', 'Corolla', 'Yaris', 'RAV4'], required: true },
  nivelDeConforto: { type: String, enum: ['básico', 'luxuoso'], required: true },
}, { timestamps: true });

const MotoristaSchema = new mongoose.Schema({
  nome: String,
  NIF: Number,
  genero: String,
  anoDeNascimento: Number,
  cartaDeConducao: { type: Number, required: true, unique: true },
  morada: { type: mongoose.Schema.Types.ObjectId, ref: 'Morada' },
}, { timestamps: true });

const ClienteSchema = new mongoose.Schema({
  nome: String,
  NIF: Number,
  genero: String
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  precoPorMinBasico: { type: Number, required: true, min: 0 },
  precoPorMinLuxuoso: { type: Number, required: true, min: 0 },
  acrescimoPercentual: { type: Number, required: true, min: 0 },
}, { timestamps: true });

const Morada = mongoose.model('Morada', MoradaSchema);
const Motorista = mongoose.model('Motorista', MotoristaSchema);
const Taxi = mongoose.model('Taxi', TaxiSchema);
const Cliente = mongoose.model('Cliente', ClienteSchema);
const Settings = mongoose.model('Settings', SettingsSchema);

// Rotas com asyncHandler

app.get('/init', asyncHandler(async (req, res) => {
  await Promise.all([
    Morada.deleteMany({}),
    Motorista.deleteMany({}),
    Taxi.deleteMany({}),
    Settings.deleteMany({}),
    Cliente.deleteMany({})
  ]);

  const moradas = await Morada.insertMany([
    { id: 1, rua: 'Rua das Flores', numeroDaPorta: 12, codigoPostal: '1000-100', localidade: 'Lisboa' },
    { id: 2, rua: 'Avenida Central', numeroDaPorta: 45, codigoPostal: '4000-100', localidade: 'Porto' },
  ]);

  await Taxi.insertMany([
    { matricula: 'AB-12-CD', anoDeCompra: 2020, marca: 'Toyota', modelo: 'Corolla', nivelDeConforto: 'básico' },
    { matricula: 'EF-34-GH', anoDeCompra: 2023, marca: 'Ford', modelo: 'Fiesta', nivelDeConforto: 'luxuoso' },
  ]);

  await Motorista.insertMany([
    { nome: 'João Silva', NIF: 123456789, genero: 'Masculino', anoDeNascimento: 1980, cartaDeConducao: 123, morada: moradas[0]._id },
    { nome: 'Ana Costa', NIF: 987654321, genero: 'Feminino', anoDeNascimento: 1995, cartaDeConducao: 321, morada: moradas[1]._id },
  ]);

  await Settings.create({ precoPorMinBasico: 0.15, precoPorMinLuxuoso: 0.25, acrescimoPercentual: 20 });

  await Cliente.create({ nome: 'Carlos Lopes', NIF: 111222333, genero: 'Masculino' });

  res.json({ message: 'Base de dados inicializada!' });
}));

app.get('/moradas', asyncHandler(async (req, res) => {
  const moradas = await Morada.find().sort({ createdAt: -1 });
  res.json(moradas);
}));

app.get('/motoristas', asyncHandler(async (req, res) => {
  const motoristas = await Motorista.find().populate('morada').sort({ createdAt: -1 });
  res.json(motoristas);
}));

app.get('/taxis', asyncHandler(async (req, res) => {
  const taxis = await Taxi.find().sort({ createdAt: -1 });
  res.json(taxis);
}));

app.get('/clientes', asyncHandler(async (req, res) => {
  const clientes = await Cliente.find().sort({ createdAt: -1 });
  res.json(clientes);
}));

app.post('/morada', asyncHandler(async (req, res) => {
  const { id, rua, numeroDaPorta, codigoPostal, localidade } = req.body;

  if (!/^[0-9]{4}-[0-9]{3}$/.test(codigoPostal)) {
    return res.status(400).json({ message: 'Código postal inválido. O formato deve ser "1111-111".' });
  }

  const morada = new Morada({ id, rua, numeroDaPorta, codigoPostal, localidade });
  await morada.save();
  res.json(morada);
}));

app.get('/settings', asyncHandler(async (req, res) => {
  const settings = await Settings.find();
  res.json(settings);
}));

app.post('/motorista', asyncHandler(async (req, res) => {
  const { nome, NIF, genero, anoDeNascimento, cartaDeConducao, morada } = req.body;

  const anoAtual = new Date().getFullYear();
  if (anoAtual - anoDeNascimento < 18) {
    return res.status(400).json({ message: 'O motorista deve ter pelo menos 18 anos de idade.' });
  }

  if (!/^[1-9][0-9]{8}$/.test(NIF)) {
    return res.status(400).json({ message: 'NIF inválido. Deve conter 9 dígitos e não começar por 0.' });
  }

  if (!['Masculino', 'Feminino'].includes(genero)) {
    return res.status(400).json({ message: 'Género inválido. Valores permitidos: Masculino ou Feminino.' });
  }

  const motorista = new Motorista({ nome, NIF, genero, anoDeNascimento, cartaDeConducao, morada });
  await motorista.save();
  res.json(motorista);
}));

app.post('/taxi', asyncHandler(async (req, res) => {
  const { matricula, anoDeCompra, marca, modelo, nivelDeConforto } = req.body;

  const anoAtual = new Date().getFullYear();
  if (anoDeCompra > anoAtual) {
    return res.status(400).json({ message: 'O ano de compra deve ser menor que o ano atual' });
  }

  if (!['básico', 'luxuoso'].includes(nivelDeConforto)) {
    return res.status(400).json({ message: 'Nível de conforto inválido. Permitidos: básico ou luxuoso.' });
  }

  const taxi = new Taxi({ matricula, anoDeCompra, marca, modelo, nivelDeConforto });
  await taxi.save();
  res.json(taxi);
}));

app.put('/settings', asyncHandler(async (req, res) => {
  const { precoPorMinBasico, precoPorMinLuxuoso, acrescimoPercentual } = req.body;

  if (precoPorMinBasico <= 0 || precoPorMinLuxuoso <= 0) {
    return res.status(400).json({ message: 'Preços por minuto devem ser positivos.' });
  }

  if (acrescimoPercentual < 0) {
    return res.status(400).json({ message: 'A percentagem de acréscimo deve ser positiva ou zero.' });
  }

  const updatedSettings = await Settings.findOneAndUpdate(
    {},
    { precoPorMinBasico, precoPorMinLuxuoso, acrescimoPercentual },
    { new: true }
  );

  if (!updatedSettings) {
    return res.status(404).json({ message: 'Definições não encontradas.' });
  }

  res.json(updatedSettings);
}));

app.listen(PORT, () => {
  console.log(`Servidor a rodar na porta ${PORT}`);
});
