
import { Schema, model } from "mongoose";

const userSchema = new Schema<UserDB>({
    username: { type : String, required: true, trim: true, unique: true, lowercase: true },
    email: { type : String, required : true, trim: true, unique: true, lowercase: true },
    password: { type : String, required : true, trim: true, minlength: 6 },
    role: { type : String, required : true, trim: true },
}, {
    timestamps: true
});

// Funcion para guardar datos del usuario en la base de datos.
const saveUser = async (userData: UserDB): Promise<UserDB> => {
    return await User.create(userData);
}

// Funcion reutilizable para buscar un usuario tanto por su id, nombre o email y devuelve el objeto completo de ese usuario
const findUser = async (user: string): Promise<UserDB | null>  => {
    return await User.findOne({ $or:[ { _id: user } ,{ username: user }, { email: user }]} );
};

const deleteUser = async (id: string): Promise<void> => {
    await User.deleteOne({ _id: id });
};

const getAllUsers = async ():Promise<UserDB[]> => {
    return await User.find();
}


// Creamos el modelo apartir del esquema que estructuramos y exportamos nuestro modelo para que pueda ser utilizado.
export const User = model<UserDB>('User', userSchema);
export default User;

// Exportamos los metodos que creamos para que el controllador los use
export { saveUser, findUser, deleteUser, getAllUsers }
