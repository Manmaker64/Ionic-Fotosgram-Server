import { FileUpload } from '../interfaces/file-upload';
import path from 'path';
import fs from 'fs';
import uniqid from 'uniqid';

export default class FileSystem {
    constructor() {}

    guardarImagenTemporal( file: FileUpload, userId: string ) {

        return new Promise( (resolve, reject) => {
            // Crear carpetas
            const path = this.crerCarpetaUsuario( userId );
    
            // Nombre archivo
            const nombreArchivo = this.generarNombreUnico( file.name );
            
            // Mover el archivo del Temp a nuestra carpeta Temp
            file.mv( `${ path }/${ nombreArchivo }`, (err: any) => {
                if ( err ) {
                    // No se pudo mover el archivo
                    reject( err );
                } else {
                    // Se movió correctamente el archivo
                    resolve();
                }
            });
        });
    }

    imagenesDeTempHaciaPost( userId: string ) {
        const pathTemp = path.resolve( __dirname, '../uploads/', userId, 'temp' );
        const pathPost = path.resolve( __dirname, '../uploads/', userId, 'posts' );

        if ( !fs.existsSync( pathTemp ) ) {
            return [];
        }
        if ( !fs.existsSync( pathPost ) ) {
            fs.mkdirSync( pathPost );
        }

        const imagenesTemp = this.obtenerImagenesEnTemp( userId );

        // Mover imágenes desde la carpeta Temp a la carpeta Posts
        imagenesTemp.forEach( imagen => {
            fs.renameSync( `${ pathTemp }/${ imagen }`, `${ pathPost }/${ imagen }` )
        });

        // Retorno los nombres de la imagenes
        return imagenesTemp;
    }

    getFotoUrl( userId: string, img: string ) {
        // Path Posts
        const pathFoto = path.resolve( __dirname, '../uploads/', userId, 'posts', img );
        // Si la imagen existe
        const existe = fs.existsSync( pathFoto );
        if ( !existe ) {
            return path.resolve( __dirname, '../assets/400x250.jpg' );
        }

        return pathFoto;
    }

    private generarNombreUnico( nombreOriginal: string ) {
        const nombreArray = nombreOriginal.split('.');
        const extension = nombreArray[ nombreArray.length - 1 ];

        const idUnico = uniqid();

        return `${ idUnico }.${ extension }`;
    }

    private crerCarpetaUsuario( userId: string ) {
        const pathUser = path.resolve( __dirname, '../uploads/', userId );
        const pathUserTemp = pathUser + '/temp';
        
        const existe = fs.existsSync( pathUser );

        if ( !existe ) {
            fs.mkdirSync( pathUser );
            fs.mkdirSync( pathUserTemp );
        }

        return pathUserTemp;
    }

    private obtenerImagenesEnTemp( userId: string ) {
        const pathTemp = path.resolve( __dirname, '../uploads/', userId, 'temp' );
        return fs.readdirSync( pathTemp ) || [];
    }
}