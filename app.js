const express = require('express');
const app = express();
const morgan = require('morgan'); 
const { use } = require('./routes/produtos');


app.use(morgan('dev')); //Usado em modo dev
app.use('/uploads', express.static('uploads')); //Deixa o diretorio publico

//usado para as requisições a API
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Define o que é permitido no cabeçalho da requisição
app.use((req, res, next) => {
    req.header('Access-Control-Allow-Origin', '*');//Significa que qualquer servidor tem acesso a API
    req.header(
        'Access-Crotrol-Allow-Header',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if(req.method === 'OPTIONS'){
        req.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }
    next();
});

//Rotas
const routerProdutos = require('./routes/produtos');
const routerUsuarios = require('./routes/usuarios');
app.use('/produtos', routerProdutos);
app.use('/usuarios', routerUsuarios);


// Quando não encontra uma rota, entra aqui
app.use((req, res, next) => {
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: error.message
        }
    });
});

module.exports = app;