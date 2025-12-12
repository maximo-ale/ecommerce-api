export interface User{
    id: string,
    name: string,
    email: string,
    password: string,
    isAdmin: boolean,
}

export interface ProtectedUserInfo{
    id: string,
    name: string,
}

export interface RegisterUser{
    name: string,
    email: string,
    password: string,
    isAdmin?: boolean,
}


export interface LoginUser{
    name?: string,
    email?: string,
    password: string,
}

export interface UserInfoWithToken extends ProtectedUserInfo{
    token: string,
}