import axios from 'axios';
import prismaClient from '../prisma';
import { sign } from 'jsonwebtoken';

interface IAccessTokenResponse {
    access_token: string;
}

interface IUserResponse {
    avatar_url: string,
    login: string,
    id: number,
    name: string
}

/**
 * Get code(string)
 * Recover o access_token from github
 * Verifiy if user exists on database
 * if user exists, generate a token
 * if user not exists, create a new user and generate a token
 * return token and user
 */
class AuthenticateUserService {
    async execute(code: string) {
        const url = 'https://github.com/login/oauth/access_token';
        const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, {
            params: {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            headers: {
                accept: 'application/json',
            },
        });

        const response = await axios.get<IUserResponse>('http://api.github.com/user', {
            headers: {
                authorization: `Bearer ${accessTokenResponse.access_token}`,
            }
        });

        const { login, id, avatar_url, name } = response.data;
        let user = await prismaClient.user.findFirst({
            where: {
                github_id: id
            }
        });

        if (!user) {
            user = await prismaClient.user.create({
                data: {
                    github_id: id,
                    login,
                    avatar_url,
                    name
                }
            });
        }

        const token = sign(
            { user: {
                name: user.name,
                avatar_url: user.avatar_url,
                id: user.id
            } },
            process.env.JWT_SECRET,
            {
                subject: user.id.toString(),
                expiresIn: '1d'
            }
        );

        return { token, user };
    }
}

export { AuthenticateUserService };
