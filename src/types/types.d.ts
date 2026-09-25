

// Contrato que define el tipo de los datos guardados en los tipos de login de JWT y sessions.
interface UserData {
    _id: string;
    role: string
}

// Definimos el type Method para indicar que valores unicamente puede tener el metodo de login. 
type Method = 'jwt' | 'cookie';
