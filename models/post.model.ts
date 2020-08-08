import { Schema, Document, model } from 'mongoose';
import moment from 'moment';

const postSchema = new Schema({
    created: {
        type: String
    },
    mensaje: {
        type: String
    },
    imgs: [{
        type: String
    }],
    coords: {
        type: String // lat, lng
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [ true, 'Debe de existir una referencia a un usuario' ]
    }
});

interface IPost extends Document {
    created: String;
    mensaje: string;
    imgs: string[];
    coords: string;
    usuario: string;
}

postSchema.pre<IPost>( 'save', function( next ) {
    this.created = moment().format( 'DD/MM/YYYY, HH:MM:SS' );
    next();
});

export const Post = model<IPost>('Post', postSchema);