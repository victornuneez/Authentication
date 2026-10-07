
import { Schema, model } from "mongoose";
import type { UserDBDocument } from "../types/typeDocumentsMongoDB.js";

const userSchema = new Schema<UserDB>({
    username: { type : String, required: true, trim: true, unique: true, lowercase: true },
    email: { type : String, required : true, trim: true, unique: true, lowercase: true },
    password: { type : String, required : true, trim: true, minlength: 6 },
    role: { type : String, required : true, trim: true },
}, {
    timestamps: true
});

// Funcion para guardar datos del usuario en la base de datos.
const saveUser = async (userData: UserDB): Promise<UserDBDocument> => {
    return await User.create(userData);
}

// Funcion reutilizable para buscar un usuario tanto por su id, nombre o email y devuelve el objeto completo de ese usuario
const findUserById = async (_id: string): Promise<UserDBDocument | null>  => {
    return await User.findOne({ _id: _id });
};

const findUserByUsername = async (username: string): Promise<UserDBDocument | null>  => {
    return await User.findOne({ username: username });
};

const findUserByEmail = async (email: string): Promise<UserDBDocument | null>  => {
    return await User.findOne({ email: email });
};

const deleteUserById = async (id: string): Promise<void> => {
    await User.deleteOne({ _id: id });
};

const getAllUsers = async ():Promise<UserDBDocument[]> => {
    return await User.find();
}


// Creamos el modelo apartir del esquema que estructuramos y exportamos nuestro modelo para que pueda ser utilizado.
export const User = model<UserDB>('User', userSchema);
export default User;

// Exportamos los metodos que creamos para que el controllador los use
export { saveUser, findUserById, findUserByUsername, findUserByEmail, deleteUserById, getAllUsers }
