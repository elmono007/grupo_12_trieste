// En main.js de rutas, le indicamos a la aplicacion donde
// o quien maneja las rutas. Esto es QUE Controlador los hace.
// Por eso debemos Requerirlo al modulo

const express = require('express');
const mainController = require('../controllers/mainController');
const router = express.Router();         //Definimos la variable router quien nos va a rutear los pedidos al controlados

router.get('/', mainController.home);

router.get('/login', mainController.login);

router.get('/registro', mainController.registro);

router.get('/ofertas', mainController.ofertas);

router.get('/carrito', mainController.carrito);

router.get('/productos', mainController.productos);


//Devolvemos el objeto router con todas las rutas y donde encontrarlas dentro del controlador.
module.exports = router;


