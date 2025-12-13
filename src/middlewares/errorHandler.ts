import { AppError } from '../utils/errors';
import type { Request, Response, NextFunction } from 'express';
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError){
        return res.status(err.statusCode).json({error: err.message});
    }

    if (err.code === '23505'){
        //const fields = Object.keys(err.keyValue).join(', ');
        //const values = Object.values(err.keyValue).join(', ');
        return res.status(400).json({message: `Duplicated key error`}); //${fields}: ${values}
    }

    console.error(err.stack);
    return res.status(500).json({message: 'Internal server error'});
}

export default errorHandler;