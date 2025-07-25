
const path = require('path');
const express = require('express');
require('dotenv').config();
const cors = require('cors')
const { dbConnection } = require('./database/config');
// console.log(process.env);


//Crear el servidor de express
const app = express();

//Base de datos
if (process.env.NODE_ENV !== 'test') {
    dbConnection();
}

// CORS
app.use( cors() )

//Directorio Publico
app.use( express.static('public') )

// Lectura y parseo del body
app.use( express.json() );

//Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));

app.use('/{*splat}', ( req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

//Escuchar Peticiones
if (process.env.NODE_ENV !== 'test') {
    app.listen( process.env.PORT, () => {
        console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
        
    })
}

module.exports = app;
