
import { Schema, model } from "mongoose";
import type { RefreshTokenDocument } from "../types/typeRefreshTokenDocument.js";

const RefreshTokenSchema = new Schema<RefreshTokenPayload>({
    userId: { type: String, required: true, trim: true },
    jti: { type : String, required: true, trim: true, unique: true },
    type: { type : String, required : true, trim: true },
}, {
    timestamps: true
});

// Funcion para guardar el refresh token en la base de datos.
// En caso de que no se realice correctamente el guardado, en el estado de la Promise se devuelve un error, que el metodo generateSession
// atrapara en el catch.
const saveRefreshToken = async (refreshToken: RefreshTokenPayload): Promise<void> => {
    await Refresh.create(refreshToken);
}

// Funcion para buscar el refresh token por su jti y devuelve el objeto completo de ese refresh token
const findRefreshToken = async (jti: string): Promise<RefreshTokenDocument | null>  => {
    return await Refresh.findOne({ jti: jti });
};

const deleteRefreshToken = async (jti: string): Promise<void> => {
    await Refresh.deleteOne({ jti: jti });
};


// Creamos el modelo apartir del esquema que estructuramos y exportamos nuestro modelo para que pueda ser utilizado.
export const Refresh = model<RefreshTokenPayload>('RefreshToken', RefreshTokenSchema);
export default Refresh;

// Exportamos los metodos que creamos para que el controllador los use
export { saveRefreshToken, findRefreshToken, deleteRefreshToken }
