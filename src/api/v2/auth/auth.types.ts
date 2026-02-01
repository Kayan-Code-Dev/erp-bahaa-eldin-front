export type TLoginRequest = {
    email: string;
    password: string;
};

export type TLoginResponse = {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
};
