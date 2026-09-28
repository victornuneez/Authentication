

// Contrato que define el tipo de los datos guardados en los tipos de login de JWT y sessions.
interface UserData {
    _id: string;
    role: string
}

// Definimos el type Method para indicar que valores unicamente puede tener el metodo de login. 
type Method = 'jwt' | 'cookie';


// Contrato que define las propiedades y tipos de datos que se guardan en la base de datos.
interface UserDB {
    _id?: string;
    username: string;
    email: string;
    password: string;
    role: string;
    createdAt?: Date;
    updated?: Date;
}

// Definimos el unico valor que puede tener la propiedad type del refreshToken
type RefreshToken = 'refresh'
// Contrato que define la estructura del refresh token utilizado en la aplicacion.
interface RefreshTokenPayload {
    _id: string;
    jti: string;
    type: RefreshToken;
}