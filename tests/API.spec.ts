import {test, expect, request} from "@playwright/test";
import {HTTPCredentials} from "@playwright/test";
// @ts-ignore
import {user} from "./Credentials/Credentials"
import {api} from "./Page1";


export let token;

test('getAllBooks', async ({request}) => {
    const responseBody = await api.getAllBooks(request)
    expect(responseBody.books[0].title).toBe('Git Pocket Guide')
    expect(JSON.stringify(responseBody.books)).toContain('Git Pocket Guide')
    expect(responseBody.books[2].isbn).toBe("9781449337711")
})

test("Generate Token", async ({request}) => {
    token = await api.getToken(request)

})
test("Check user ID", async ({request}) => {
    const response = await request.get('https://demoqa.com/Account/v1/User/' + user.userID, {
        headers: {Authorization: `Bearer ${token}`},
    });
    const responseBody = await response.json();
    expect(response.status()).toBe(200)
});

test("Add book", async ({request}) => {
    const response = await request.post('https://demoqa.com/BookStore/v1/Books', {
        headers: {Authorization: `Bearer ${await api.getToken(request)}`},
        data: {

            userId: user.userID,
            collectionOfIsbns:
                [
                    {
                        isbn: "9781449325862"
                    }
                ]

        }


    })
    const responseBody = await response.json()
    expect(JSON.stringify(responseBody)).toContain("9781449325862")
})

test("check if the book was added", async ({request}) => {
    const response = await request.get(`https://demoqa.com/Account/v1/User/${user.userID}`, {
        headers: {Authorization: `Bearer ${await api.getToken(request)}`},
        data:{}
    });
    const responseBody = await response.json();
    expect(response.status()).toBe(200)
    expect(JSON.stringify(responseBody)).toContain("9781449325862")
});

test("Delete the book", async ({request}) => {
    const response = await request.delete(`https://demoqa.com/BookStore/v1/Books?UserId=${user.userID}`,{
        headers: {Authorization: `Bearer ${await api.getToken(request)}`}
    });
    expect(response.status()).toBe(204)
});

test("Check if the book was deleted", async ({request}) => {
    const response = await request.get(`https://demoqa.com/Account/v1/User/${user.userID}`, {
        headers: {Authorization: `Bearer ${await api.getToken(request)}`},
        data:{}
    });
    const responseBody = await response.json();
    expect(response.status()).toBe(200)
    expect(responseBody.books).toStrictEqual([])
});