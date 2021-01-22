"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
var crypto_1 = __importDefault(require("crypto")); // Native Node.js
exports.default = {
    storage: multer_1.default.diskStorage({
        destination: path_1.default.resolve(__dirname, '..', '..', 'uploads'),
        filename: function (request, file, callback) {
            // Generating hash and passing the amount of bytes / amount of random hash characters
            var hash = crypto_1.default.randomBytes(6).toString('hex');
            var filename = hash + "-" + file.originalname;
            callback(null, filename);
        }
    }),
};
