import type { HydratedDocument } from 'mongoose';

// HydratedDocument representa el documento de Mongoose que existe en memoria.
// HydratedDocument<RefreshTokenPayload> indica que el documento contiene los campos del payload, mas las propiedades y metodos de Mongoose.
export type RefreshTokenDocument = HydratedDocument<RefreshTokenPayload>;
export type UserDBDocument = HydratedDocument<UserDB>;