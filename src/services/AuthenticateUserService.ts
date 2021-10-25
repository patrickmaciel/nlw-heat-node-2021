import axios from 'axios';

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
        const response = await axios.post(url, null, {
            params: {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            headers: {
                accept: 'application/json',
            },
        });

        return response.data;
    }
}

export { AuthenticateUserService };
