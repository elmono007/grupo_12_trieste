//Traemos la base de datos con Sequelize
const db = require('../../Database/models');

const Op = db.Sequelize.Op; // Para operadores del WHERE.

// Traemos el File System para trabajar con JSON
const fs = require('fs');

// Guardamos el resultado de las validaciones para devolverlas en 
// el Front y una variable global para el mensaje de error del contenido del form
const {validationResult} = require('express-validator');

//Requerimos el Model Products
const modelProducts = require('../model/modelProducts');

//Seteamos la variable path para contener el path a la pagina
const path = require('path');
const { getAllProductos } = require('../model/modelProducts');
const producto = require('../model/modelProducts');
const { listeners } = require('process');

const jsonPath = path.join(__dirname,'../../database/InfoDiscos.json');

const json = JSON.parse(fs.readFileSync(jsonPath,'utf-8'));

/*const listadoDiscos = json.map(e => {
    return {
      
      id: e.id,
      nombreArtista: e.nombreArtista,
      nombreDisco: e.nombreDisco,
      precio: e.precio,
      stock: e.stock,
      sku: e.sku,
      categoria: e.categoria,
      vendidos: e.vendidos,
      recomendado: e.recomendado,
      img: e.img,

    }
  });
*/
let listadoDiscos = {};
let generos = [];
let artistas = [];

/*const generos = async () => {
  await db.Genero.findAll({
    raw : true, 
    nest: true,
  }).then(generos => {
      return generos });
  }

  const artistas = async () => {
    await db.Artista.findAll({
      raw : true, 
      nest: true,
    }).then(artistas => {
        return artistas });
    }
  
    console.log(artistas);*/

// Generamos un array con todas las letras que vamos a usar para la busqueda avanzada.
const alpha = Array.from(Array(26)).map((e, i) => i + 65);
const alfabeto = alpha.map((x) => String.fromCharCode(x));

//definimos el objeto Controller
const controller = {
    
    artistas: artistas,
    generos: generos,

    //LISTADO DE PRODUCTOS
    productos: (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session.nombre;

      db.Producto.findAll({
        raw : true, 
        nest: true,
        include: [{
          association: 'artista',
        }, 
        {
          association: 'genero',
        }]
      })
        .then(productos => {
          
          res.render(path.join(__dirname, '../views/products/productos'), {
            'session': userSession,
            'listadoDiscos': productos });
        })
    },

    productos1: (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session;  
      
      res.render(path.join(__dirname, '../views/products/productos'), {
        'session': userSession.userId,
        'listadoDiscos': listadoDiscos });

    //res.render(path.join(__dirname, '../views/products/productos'), {'listadoDiscos': listadoDiscos});
    },

    //EDITAR PRODUCTO
    productosEdit: (req, res) => {

        //Preguntamos por la sesion.
        userSession = req.session.nombre;

        db.Producto.findAll({
          raw : true, 
          nest: true,
          include: [{
            association: 'artista',
          }, 
          {
            association: 'genero',
          }]
        })
          .then(productos => {
            
            res.render(path.join(__dirname, '../views/products/productosEdit'), {
              'session': userSession,
              'listadoDiscos': productos });
          })
      },

      // res.render(path.join(__dirname, '../views/products/productosEdit'), {
      //   'session': userSession.nombre,
      //   'listadoDiscos': listadoDiscos });
    //},

    //BORRAR PRODUCTO
    borrarProducto: (req, res) => {

       //Preguntamos por la sesion.
       userSession = req.session;  
       
      let productoId = req.params.id;
      let msje;
      let nuevoListado = [];

      //Llamamos al modelo con id para que lo borre.
      if (modelProducts.delete(productoId)) {
          msje = 'Producto borrado correctamente';
          nuevoListado = getAllProductos;

        } else {
            msje = 'El Producto no se ha podido borrar';
      } 

      res.render(path.join(__dirname, '../views/products/productosEdit'), {
      'session': userSession.userId,
       'msje': msje,
       'listadoDiscos': getAllProductos() });

    },

    //MODIFICAR PRODUCTO
    modificarProducto: (req, res) => {
      
      //Vamos a modificar un producto. 
      //Creamos primero el objeto con los valores del formulario.
      const {
        nombreArtista,
        nombreDisco,
        categoria,
        precio,
        stock,
        sku,
        recomendado,
        imagen
      }=req.body;

      console.log(req.body);
      console.log(req.params.id);

      const productoId = req.body.id;
      const productoAModificar = modelProducts.findByPk(productoId);
      
      if (productoAModificar) {
        //Armamos las modificaciones

        productoAModificar.nombreArtista = nombreArtista;
        productoAModificar.nombreDisco = nombreDisco;
        productoAModificar.categoria = categoria;
        productoAModificar.precio = precio;
        productoAModificar.stock = stock;
        productoAModificar.sku = sku;
        productoAModificar.recomendado = recomendado ? recomendado : false,
        productoAModificar.imagen = imagen;

        res.send(productoAModificar);
      } else {
        res.send('No hay estereo no hay')
      }

    },

    //DASHBOARD
    dashboard: (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session;  

      //Traemos algunos productos 
      res.render(path.join(__dirname, '../views/products/dashboard'), {
              'session': userSession.nombre,
              'listadoDiscos': listadoDiscos });
    },

    //ALTA DE PRODUCTO
    altaProducto: (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session;  
      
      if ( userSession && userSession.nombre == 'Admin') {

        /*res.render(path.join(__dirname, '../views/products/altaProducto'), {
          'session': userSession.nombre,
          'artistas': controller.artistas,
          'generos': controller.generos }); 
          */
        
        //levantamos los generos y los artistas para el alta de producto.
        db.Genero.findAll({
          raw : true, 
          nest: true,
        }).then(generos => {
        
          db.Artista.findAll({
          raw : true, 
          nest: true,
          }).then(artistas => {
              res.render(path.join(__dirname, '../views/products/altaProducto'), {
              'session': userSession.nombre,
              'artistas': artistas,
              'generos': generos });  
            })
        });
      } else {
        res.send('Página no encontrada');
      }    
    },
    
    //ALTA DE PRODUCTO POST
    altaProductoPost: async (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session.nombre;

      //Vamos a dar de alta un usuario. 
      //Creamos primero el objeto con los valores del formulario.
      const {
        nombreArtista,
        nombreDisco,
        categoria,
        precio,
        oferta,
        stock,
        sku,
        recomendado,
        imagen
    } = req.body;

     //Traemos las validaciones del Formulario de Alta de Producto
     const errores = validationResult(req);
     
     if (errores.isEmpty()) { //Todo bien en el formulario, procedemos a crear el articulo.

        console.log(oferta);
        //console.log(sku);

        //ahora validamos que el producto (SKU) no exista.
        try {
          
          const productoSku = await db.Producto.findOrCreate({ 
            where: { sku: sku }, 
            defaults: {
                nombre_disco: nombreDisco, 
                genero_id: categoria, 
                stock: stock, 
                sku: sku, 
                recomendado: recomendado, 
                artista_id: nombreArtista, 
                img: imagen, 
                precio: precio,
                oferta: oferta },
            raw : true, 
            nest: true
          });  
          
          if (productoSku[1]) {           //True --> entonces se creo correctamente
             const msjeExito = 'Producto Creado Satisfactoriamente';
             const msjeType = 'S';
             //alert(msjeExito);
             
             //res.redirect('/altaProducto',);
            res.render(path.join(__dirname, '../views/products/altaProducto'), {
              'session': userSession,
              'msje': msjeExito, 
              'type': msjeType,
              'errores': errores.array(),
              'prev': req.body,
              'artistas': artistas,
              'generos': generos
               });
          
          } else {
              
              const msjeError = 'El producto ya existe';
              const msjeType = 'E';

              res.render(path.join(__dirname, '../views/products/altaProducto'), {
                'session': userSession,
                'msje': msjeError,
                'type': msjeType, 
                'errores': errores.array(),
                'prev': req.body,
                'artistas': artistas,
                'generos': generos });
          }

        } catch (error) {

          console.log('entro en esta');
            
          const msjeError = 'Error en la creación del Producto. Volver a intentar más tarde';
          const msjeType = 'E';

            res.render(path.join(__dirname, '../views/products/altaProducto'), {
              'session': userSession,
              'msje': msjeError, 
              'type': msjeType,
              'errores': errores.array(),
              'prev': req.body,
              'artistas': artistas,
              'generos': generos });  
        };


    }else{
        // Acá sí hubo errores en alguno de los campos de los formularios.
        // Renderizamos el formulario con el arreglo de errores para que los muestre y los valores
        // que ya traía, para que queden visualizados.
        res.render(path.join(__dirname, '../views/products/altaProducto'),{
          'errores':errores.array(),
          'prev': req.body,
          'artistas': artistas,
          'generos': generos
          });
    }
    },

    altaProductoPost1: (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session.nombre;

      //Vamos a dar de alta un usuario. 
      //Creamos primero el objeto con los valores del formulario.
      console.log('ES ESTE BABY');
      console.log(req.body);

      const {
        nombreArtista,
        nombreDisco,
        categoria,
        precio,
        stock,
        sku,
        recomendado,
        imagen
    } = req.body;
    
     //Traemos las validaciones del Formulario de Alta de Producto
     const errores = validationResult(req);
     
     //console.log(errores);

     if (errores.isEmpty()) { //Todo bien en el formulario, procedemos a crear el articulo.

        console.log('mono');
        console.log(sku);

        //ahora validamos que el producto (SKU) no exista.
        const productoSku = modelProducts.findByField('sku', sku);
       console.log('mono');
        console.log(productoSku);
        
        console.log('ALIBABA');
       

        if (productoSku) {
            //Producto Encontrado. Ya está dado de alta
            const msjeError = 'El producto ya existe';
                res.render(path.join(__dirname, '../views/products/altaProducto'), {
                    'session': userSession,
                    'msje': msjeError, 
                    'errores': errores.array(),
                    'prev': req.body,
                    'artistas': artistas,
                    'generos': generos
                   });
        }else {
            //creamos el objeto con los valores que paso del Body y 
            const obj = {
              ...req.body,
            };
            //Llamamos al metodo de Model que da de alta el usuario
            modelProducts.create(obj);
            const msjeExito = 'Producto Creado Satisfactoriamente';
            res.render(path.join(__dirname, '../views/products/altaProducto'), 
              {'msje': msjeExito,
              'artistas': artistas,
              'generos': generos
              });
        }

     }else{
        // Acá sí hubo errores en alguno de los campos de los formularios.
        // Renderizamos el formulario con el arreglo de errores para que los muestre y los valores
        // que ya traía, para que queden visualizados.
        res.render(path.join(__dirname, '../views/products/altaProducto'),{
          'errores':errores.array(),
          'prev': req.body,
          'artistas': artistas,
          'generos': generos
        })

     }
      //res.render(path.join(__dirname, '../views/products/altaProducto'));
    },

    //ALTA GENERO
    altaGenero: (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session;  
      console.log(userSession.nombre);
      
      if ( userSession && userSession.nombre == 'Admin') {
        
        console.log('SORUYO');
        res.render(path.join(__dirname, '../views/products/altaGenero'), {
        'session': userSession.nombre
        });

      } else {

          res.send('Página no encontrada');
      }

    },

    //ALTA GENERO POST
    altaGeneroPost: async (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session.nombre;

      //Vamos a dar de alta un artista.
      const nuevoGenero = req.body.titulo;
      console.log(nuevoGenero);

      //Traemos las validaciones del Formulario de Alta de Artista
      const errores = validationResult(req);

      if (errores.isEmpty()) { //Todo bien en el formulario, procedemos a crear el articulo.
      
        console.log('todo bien gorila');

        try {
          
          const existeGenero = await db.Genero.findOrCreate({ 
            where: { titulo: nuevoGenero }, 
            defaults: {
                titulo: nuevoGenero},
            raw : true, 
            nest: true
          }); 

          if (existeGenero[1]) {           //True --> entonces se creo correctamente
            const msjeExito = 'Genero Creado Satisfactoriamente';
            const msjeType = 'S';
          
            res.render(path.join(__dirname, '../views/products/altaGenero'), {
              'session': userSession,
              'msje': msjeExito,
              'type': msjeType, 
              'errores': errores.array(),
              'prev': req.body,
              });
          
          } else {

            const msjeError = 'Genero ya existe';
            const msjeType = 'E';
          
            res.render(path.join(__dirname, '../views/products/altaGenero'), {
              'session': userSession,
              'msje': msjeError, 
              'type': msjeType,
              'errores': errores.array(),
              'prev': req.body,
              });
            
          }

        } catch (error) {
          
          const msjeError = 'Error en la creación del Género. Volver a intentar más tarde';
          const msjeType = 'E';

          res.render(path.join(__dirname, '../views/products/altaGenero'), {
            'session': userSession,
            'msje': msjeError, 
            'type': msjeType,
            'errores': errores.array(),
            'prev': req.body });  

        }

      } else {
          // Acá sí hubo errores en alguno de los campos del formulario.
          // Renderizamos el formulario con el arreglo de errores para que los muestre y los valores
          // que ya traía, para que queden visualizados.
          res.render(path.join(__dirname, '../views/products/altaGenero'),{
            'errores':errores.array(),
            'prev': req.body
            }); 
      }

    },

    //ALTA ARTISTA
    altaArtista: (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session;  
      
      if ( userSession && userSession.nombre == 'Admin') {
          
        res.render(path.join(__dirname, '../views/products/altaArtista'), {
        'session': userSession.nombre
        });

      } else {
        res.send('Página no encontrada');
      }

    },

    //ALTA ARTISTA POST
    altaArtistaPost: async (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session.nombre;

      //Vamos a dar de alta un artista.
      const nuevoArtista = req.body.nombreArtista;
      console.log(nuevoArtista);
      
      //Traemos las validaciones del Formulario de Alta de Artista
      const errores = validationResult(req);
     
      if (errores.isEmpty()) { //Todo bien en el formulario, procedemos a crear el articulo.
       
        console.log('todo bien vieja');

        try {
          
          const existeArtista = await db.Artista.findOrCreate({ 
            where: { nombre_artista: nuevoArtista }, 
            defaults: {
                nombre_artista: nuevoArtista},
            raw : true, 
            nest: true
          }); 

          if (existeArtista[1]) {           //True --> entonces se creo correctamente
            const msjeExito = 'Artista Creado Satisfactoriamente';
            const msjeType = 'S';
          
            res.render(path.join(__dirname, '../views/products/altaArtista'), {
              'session': userSession,
              'msje': msjeExito,
              'type': msjeType, 
              'errores': errores.array(),
              'prev': req.body,
               });
          
          } else {

            const msjeError = 'Artista ya existe';
            const msjeType = 'E';
          
            res.render(path.join(__dirname, '../views/products/altaArtista'), {
              'session': userSession,
              'msje': msjeError, 
              'type': msjeType,
              'errores': errores.array(),
              'prev': req.body,
               });
            
          }

        } catch (error) {
          
          const msjeError = 'Error en la creación del Artista. Volver a intentar más tarde';
          const msjeType = 'E';

          res.render(path.join(__dirname, '../views/products/altaArtista'), {
            'session': userSession,
            'msje': msjeError, 
            'type': msjeType,
            'errores': errores.array(),
            'prev': req.body });  

        }


      } else {
          // Acá sí hubo errores en alguno de los campos del formulario.
          // Renderizamos el formulario con el arreglo de errores para que los muestre y los valores
          // que ya traía, para que queden visualizados.
          res.render(path.join(__dirname, '../views/products/altaArtista'),{
            'errores':errores.array(),
            'prev': req.body
            }); 
      }

    },

    //DETALLE DE PRODUCTO
    productoDetalle: (req, res) => {
       //Preguntamos por la sesion.
       userSession = req.session;

       let productoId = req.params.id;

      //Buscamos el producto por Id. Para ello usamos el ModelProducts.
      let productoEncontrado = modelProducts.findByPk(productoId);

      if (!productoEncontrado) {
        productoEncontrado = undefined;
      }  
      //res.render(path.join(__dirname, '../views/products/productoDetalle'));
      
        res.render(path.join(__dirname, '../views/products/productoDetalle'), {
        'session': userSession.userId,
        'productoEncontrado': productoEncontrado });
    },

    //BUSQUEDA AVANZADA
    busquedaAvanzada: (req, res) => {
      //Preguntamos por la sesion.
      userSession = req.session.nombre;  
      
      if (req.query.keyword) {

        db.Producto.findAll({
          raw : true, 
          nest: true,
          
          include: [{
              association: 'artista',
              where: { 
                nombre_artista: { [Op.like]: req.query.keyword + '%' }
              },
            }, 
            {
              association: 'genero',
            }]
        })
          .then(productos => {
            
            res.render(path.join(__dirname, '../views/products/busquedaAvanzada'), {
              'session': userSession,
              'alfabeto': alfabeto,
              'listadoDiscos': productos });
          });

      } else {

        res.render(path.join(__dirname, '../views/products/busquedaAvanzada'), {
                'session': userSession,
                'alfabeto': alfabeto,
                'listadoDiscos': listadoDiscos });
        }
    },

    //OFERTAS
    ofertas: (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session.nombre;  

      db.Producto.findAll({
        raw : true, 
        nest: true,
        where: { 
            oferta: { [Op.gt]: 0 }
          },
        include: [{
            association: 'artista',
          }, 
          {
            association: 'genero',
          }]
      })
        .then(productos => {
          
          console.log(productos);

          res.render(path.join(__dirname, '../views/ofertas'), {
            'session': userSession,
            'alfabeto': alfabeto,
            'listadoDiscos': productos });
        });
/*
      res.render(path.join(__dirname, '../views/ofertas'), {
        'session': userSession,
        'listadoDiscos': listadoDiscos });*/

    },

    //LISTADO ARTISTAS
    listadoArtistas: (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session;

      if ( userSession && userSession.nombre == 'Admin') {
        
        db.Artista.findAll({
          raw : true, 
          nest: true,
          })
          .then(artistas => {
            res.render(path.join(__dirname, '../views/products/listadoArtistas'), {
              'session': userSession.nombre,
              'listadoArtistas': artistas });
          })

    } else {
        res.send('Página Artistas no encontrada');
     }

    },

    //LISTADO GENEROS
    listadoGeneros: (req, res) => {

      //Preguntamos por la sesion.
      userSession = req.session;

      if ( userSession && userSession.nombre == 'Admin') {
        
        db.Genero.findAll({
          raw : true, 
          nest: true,
          })
          .then(generos => {
            res.render(path.join(__dirname, '../views/products/listadoGeneros'), {
              'session': userSession.nombre,
              'listadoGeneros': generos });
        })

      }  else {
        res.send('Página Géneros no encontrada');
     }
    }

  }

// Finalizamos devolviendo el objeto
module.exports = controller;