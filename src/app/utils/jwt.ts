import jwt, {JwtPayload, SignOptions } from "jsonwebtoken"

const createToken = (payload: JwtPayload, secret: string, {expiresIn}: SignOptions) => {
    const token = jwt.sign(payload, secret, {expiresIn});
    return token;
}

const varifyToken = (token: string, secret: string) => {
    try {
        const decodedToken = jwt.verify(token, secret);

        return {
            success: true,
            data: decodedToken,
        }
    } catch (error: unknown) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            error
        }
    }
}

const decodeToken  = (token: string) => {
    const decodedToken = jwt.decode(token) as JwtPayload;

    return {
        success: true,
        data: decodedToken
    }
}

export const jwtUtils = {
    createToken,
    varifyToken,
    decodeToken,
}