import { AppError } from '../utils/errors.js';

const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError){
        return res.status(err.statusCode).json({error: err.message});
    }

    if (err.code === 11000){
        const fields = Object.keys(err.keyValue).join(', ');
        const values = Object.values(err.keyValue).join(', ');
        return res.status(400).json({message: `Duplicated key for ${fields}: ${values}`});
    }

    console.error(err.stack);
    return res.status(500).json({message: 'Internal server error'});
}

export default errorHandler;