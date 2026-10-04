import {user} from "./Credentials/Credentials"
import {APIRequestContext, expect} from "@playwright/test";
import {token} from "../tests/API.spec"


export class api {
    static async getToken(request: APIRequestContext): Promise<void> {
        const response = await request.post('https://demoqa.com/Account/v1/GenerateToken',
            {
                data: {
                    userName: user.userName,
                    password: user.password
                }
            });
        const responseBody = await response.json()
        expect(response.status()).toBe(200)
        return responseBody.token
    }

    static async getAllBooks(request: APIRequestContext): Promise<void> {
        const response = await request.get('https://demoqa.com/BookStore/v1/Books',);
        const responseBody = await response.json()
        expect(response.status()).toBe(200)
        return responseBody
    }

}
