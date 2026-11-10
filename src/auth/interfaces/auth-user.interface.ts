export interface AuthUser {
    id: string;
    email: string;
}

export interface AuthRequest extends Request {
    user: AuthUser;
}
