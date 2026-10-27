// Contrato que define el tipo y los datos que va a devolver la funcion auxiliar refreshToken
export type RefreshResult = {
    accessToken: string,
    refreshToken: string,
    user: UserData // Representa los datos del usuario que necesitamos para autenticar la peticion y concretamente su _id y su role.
};

