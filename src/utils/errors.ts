export class AppError extends Error{
    public statusCode: number;

    constructor(statusCode: number, message: string){
        super(message);
        this.statusCode = statusCode;
    }
}

export class NotFoundError extends AppError{
    constructor(message = 'Not found'){
        super(404, message);
    }
}

export class BadRequestError extends AppError{
    constructor(message = 'Bad request'){
        super(400, message);
    }
}

export class NoTokenError extends AppError{
    constructor(message = 'No token'){
        super(401, message);
    }
}

export class NotAuthorizedError extends AppError{
    constructor(message = 'Not authorized'){
        super(403, message);
    }
}

export class TooManyRequestsError extends AppError{
    constructor(message = 'Too many requests'){
        super(429, message);
    }
}