import { Router, Request, Response } from 'express';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import Token from '../classes/token';
import { verificaToken } from '../middlewares/autenticacion';

const userRoutes = Router();

// Login
userRoutes.post( '/login', (req: Request, res: Response ) => {
    const body = req.body;
    Usuario.findOne( { email: body.email }, ( err, userDB ) => {
        if ( err ) throw err;

        if ( !userDB ) {
            return res.json({
                ok: false,
                mensaje: 'Usuario/Contraseña no son correctos'
            });
        }

        if( userDB.compararPassword( body.password ) ) {
            const tokenUser = generarToken( userDB );

            res.json({
                ok: true,
                token: tokenUser
            });
        } else {
            return res.json({
                ok: false,
                mensaje: 'Usuario/Contraseña no son correctos *'
            });
        }
    });
});

// Crear un usuario
userRoutes.post('/create', ( req: Request, res: Response ) => {
    const user = {
        nombre: req.body.nombre,
        avatar: req.body.avatar,
        email: req.body.email,
        password: bcrypt.hashSync ( req.body.password, 10 )
    };

    Usuario.create( user )
           .then( userDB => {
                const tokenUser = generarToken( userDB );

                res.json({
                    ok: true,
                    token: tokenUser
                });
           })
           .catch( err => {
                res.json({
                    ok: false,
                    err
                });
    });
});

// Actualizar usuario
userRoutes.put( '/update', [ verificaToken ], (req: any, res: Response ) => {
    const user = {
        nombre: req.body.nombre || req.usuario.nombre,
        email: req.body.email   || req.usuario.email,
        avatar: req.body.avatar || req.usuario.avatar
    }

    Usuario.findByIdAndUpdate( req.usuario._id, user, { new: true }, (err, userDB) => {
        if ( err ) throw err;

        if ( !userDB ) {
            return res.json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID'
            });
        }

        // Genero un nuevo Token
        const tokenUser = generarToken( userDB );

        res.json({
            ok: true,
            token: tokenUser
        });
    });
});

function generarToken( usuarioDB: any ) {
    const token = Token.getJwtToken({
        _id: usuarioDB._id,
        nombre: usuarioDB.nombre,
        email: usuarioDB.email,
        avatar: usuarioDB.avatar
    });

    return token;
}

// Retorna toda la información que contiene el token de un usuario
userRoutes.get('/', [ verificaToken ], (req: any, res: Response ) => {
    const usuario = req.usuario;

    res.json({
        ok: true,
        usuario
    })
});

export default userRoutes;