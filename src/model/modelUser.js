// Importamos FS y Path para trabajar con el archivo de Usuarios
const { json } = require('express');
const fs = require('fs');
const path = require('path');

// Creamos el objeto usuario que va a ser quien maneje el modelo
const usuario = {

    //Obtenemos el nombre del archivo
    filename: path.join(__dirname, '../../Database/usuariosRegistrados.json'),

    //Traigo todos los usuarios para obtener el último numero de iD
    getAllUsuarios: () => {
        return JSON.parse(fs.readFileSync(usuario.filename,'utf-8'));
    },

    newId: () => {
        const allUsers = usuario.getAllUsuarios();
        if (allUsers.length) {
            return (allUsers[allUsers.length - 1].id) + 1;
        } else {
            return 1;
        }
    },

    create:(data) => {
        console.log('create');
        const allUsers = usuario.getAllUsuarios();
        const obj = {
            id: usuario.newId(),
            ...data,
        }

        allUsers.push(obj);

        fs.writeFile(usuario.filename,JSON.stringify(allUsers,null,' '),(err) => {
            if(err){
                return false;
            }
        });
        return obj;
    },

    findByPk: (id) => {
        return usuario.getAllUsuarios().find((element) => element.id == id);
    },

    findByField: (field, text) => {
        console.log('findbyfield');
        return usuario.getAllUsuarios().find((element) => element[field] == text);
    }
}


//Devolvemos el objeto usuario
module.exports = usuario;