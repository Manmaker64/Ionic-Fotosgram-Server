import { Router, Response } from 'express';
import { verificaToken } from '../middlewares/autenticacion';
import { Post } from '../models/post.model';
import { FileUpload } from '../interfaces/file-upload';
import FileSystem from '../classes/file-system';
import { Usuario } from '../models/usuario.model';

const postRoutes = Router();
const fileSystem = new FileSystem();

// Obtener POST paginados
postRoutes.get('/', async ( req: any, res: Response ) => {
    let pagina = Number(req.query.pagina) || 1;
    let paginacion = (pagina - 1) * 10;

    const posts = await Post.find()
                            .sort({ _id: -1 }) // Ordenar de forma descendente
                            .skip( paginacion )
                            .limit(10)
                            .populate('usuario', '-password')
                            .exec();

    res.json({
        ok: true,
        pagina,
        posts
    });
});

// Crear POST
postRoutes.post('/', [ verificaToken ], ( req: any, res: Response ) => {
    const body = req.body;
    body.usuario = req.usuario._id;

    const imagenes = fileSystem.imagenesDeTempHaciaPost( req.usuario._id );
    body.imgs = imagenes;

    Post.create( body )
        .then( async postDB => {
            // Recogemos todos los campos del usuario
            await postDB.populate('usuario', '-password').execPopulate();
            res.json({
                ok: true,
                post: postDB
            });
        })
        .catch( err => res.json(err) );
});

// Servicio para subir archivos
postRoutes.post( '/upload', [ verificaToken ], async ( req: any, res: Response ) => {
    if ( !req.files ) {
        return res.status(400).json({ 
            ok: false,
            mensaje: 'No se subió ningún archivo'
        });
    }

    const file: FileUpload = req.files.image;

    if ( !file ) {
        return res.status(400).json({ 
            ok: false,
            mensaje: 'No se subió ningún archivo - image'
        });
    }

    if ( !file.mimetype.includes('image') ) {
        return res.status(400).json({ 
            ok: false,
            mensaje: 'Lo que subió no es una imagen'
        }); 
    }

    await fileSystem.guardarImagenTemporal( file, req.usuario._id );

    res.json({
        ok: true,
        file: file.mimetype
    });
});

// Obtener una imagen
postRoutes.get('/imagen/:userid/:img', (req: any, res: Response) => {
    const userId = req.params.userid;
    const img    = req.params.img;

    const pathFoto = fileSystem.getFotoUrl( userId, img );

    res.sendFile( pathFoto );
});

export default postRoutes;