"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = require("mongoose");
const moment_1 = __importDefault(require("moment"));
const postSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Debe de existir una referencia a un usuario']
    }
});
postSchema.pre('save', function (next) {
    this.created = moment_1.default().format('DD/MM/YYYY, HH:MM:SS');
    next();
});
exports.Post = mongoose_1.model('Post', postSchema);
