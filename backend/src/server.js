const express = require('express');
const swaggerDocs = require('./config/swagger');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tarefaRoutes = require('./routes/tarefaRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const tagRoutes = require('./routes/tagRoutes');

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/tarefas', tarefaRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/tags', tagRoutes);

swaggerDocs(app);

app.get('/', (req, res) => {
    return res.json({ status: 'API Lista de Tarefas Sofisticada rodando com sucesso!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
