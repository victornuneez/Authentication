import mongoose from 'mongoose';


export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if(!mongoURI) return;
        await mongoose.connect(mongoURI);

        console.log('Conexion exitosa a la base de datos');
    } catch (error) {
        console.error('Error al conectar con la base de datos', error);
        process.exit(1);
    }
};