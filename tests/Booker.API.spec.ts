//TODO pobiez liste rezerwacji z https://restful-booker.herokuapp.com/apidoc/index.html - homework //
import {test, expect, request} from "@playwright/test";
import {HTTPCredentials} from "@playwright/test";
// @ts-ignore
import {user} from "./Credentials/Credentials"
import {api} from "./Page1";

let bookingId:Number;
let token:String;

test("TC-01 - Ping", async ({request}) =>{
    const response = await request.get('https://restful-booker.herokuapp.com/ping',
        {})
    expect(response.status()).toBe(201);
})

test("TC-02 - Download reservation list", async ({request}) =>{
    const response = await request.get('https://restful-booker.herokuapp.com/booking',
        {})
    const responseBody = await response.json();
    expect(response.status()).toEqual(200);
    expect(responseBody).toBeInstanceOf(Array);
    responseBody.forEach((element:Object) =>
        expect(JSON.stringify(element)).toContain("bookingid"))
    });


//Done works
test("TC-03 Download reservation list", async ({request}) =>{
    const response = await request.get('https://restful-booker.herokuapp.com/booking/3',
        {})
    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    ["firstname", "lastname", 
    "totalprice", "depositpaid", "bookingdates"]
    .forEach((element:String) =>
    expect(JSON.stringify(responseBody)).toContain(element));
    ["checkin", "checkout"].forEach((element:String) =>
        expect(JSON.stringify(responseBody.bookingdates)).toContain(element));
    expect(typeof(responseBody.totalprice)).toBe(typeof(1.1));
    expect(typeof(responseBody.depositpaid)).toBe(typeof(true));
 })

 test("TC-04 Filter reservation by name", async ({request}) =>{
    const response = await request.get('https://restful-booker.herokuapp.com/booking?firstname=Susan&lastname=Jackson',
        {})
    const responseBody = await response.json();
    expect(response.status()).toEqual(200);
     expect(responseBody).toBeInstanceOf(Array);
 })

test("TC-05 Incorrect id", async ({request}) =>{
    const response = await request.get('https://restful-booker.herokuapp.com/booking/9999999',
        {})
    expect(response.status()).toEqual(404);
})

test("TC-06 Get auth token", async ({request}) =>{
    const response = await request.post('https://restful-booker.herokuapp.com/auth',
        {data: { username: "admin", 
            password: "password123" }});

    const responseBody = await response.json();        
    expect(response.status()).toEqual(200);
    expect(JSON.stringify(responseBody)).toContain("token")
    expect(responseBody.token).not.toEqual("")
    token = responseBody.token;
})

test("TC-07 Wrong password used", async ({request}) =>{
    const response = await request.post('https://restful-booker.herokuapp.com/auth',
        {data: { username: "admin", 
            password: "ugabuga" }});

    const responseBody = await response.json();        
    expect(response.status()).toEqual(200);
    expect(responseBody.reason).toStrictEqual("Bad credentials")
})

test("TC-08 & TC-09 Create new reservation", async ({request}) => {
    const responsePost = await request.post('https://restful-booker.herokuapp.com/booking',
        {data: { "firstname" : "Kuba",
    "lastname" : "Bee",
    "totalprice" : 250,
    "depositpaid" : true,
    "bookingdates" : {
        "checkin" : "2030-01-01",
        "checkout" : "2035-01-01" }
            }
        });
        const responseBodyPost = await responsePost.json();
        expect(JSON.stringify(responseBodyPost)).toContain("bookingid")
        expect(typeof(responseBodyPost.bookingid)).toBe(typeof(1))
        bookingId = responseBodyPost.bookingid
        expect(responseBodyPost.booking.firstname).toStrictEqual("Kuba")  

        const responseGet = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`)
        const responseBodyGet = await responseGet.json()
        expect(responseGet.status()).toEqual(200);
        expect(responseBodyGet.firstname).toStrictEqual("Kuba");
        expect(responseBodyGet.lastname).toStrictEqual("Bee");
})

test("TC-10 Invalid request body - lack of lastname", async ({request}) => {
    const response = await request.post('https://restful-booker.herokuapp.com/booking',
        {data: { "firstname" : "Kuba",
    "totalprice" : 250,
    "depositpaid" : true,
    "bookingdates" : {
        "checkin" : "2030-01-01",
        "checkout" : "2035-01-01" }
            }
        });
        expect(response.status()).toBe(500)
    })

test("TC-11 Full edit of reservation - PUT", async ({request}) => {
    const expectedBody = { "firstname" : "Krzysiu",
        "lastname" : "Kaaaa",
        "totalprice" : 300,
        "depositpaid" : false,
        "bookingdates" : {
            "checkin" : "2035-01-01",
            "checkout" : "2040-01-01" }
        };
    const response = await request.put(`https://restful-booker.herokuapp.com/booking/${bookingId}`,
        {headers:{Cookie: `token=${token}`},
         data:  expectedBody});

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.firstname).toBe(expectedBody.firstname)
    expect(responseBody.lastname).toBe(expectedBody.lastname)
    expect(responseBody.totalprice).toBe(expectedBody.totalprice)
    expect(responseBody.depositpaid).toBe(expectedBody.depositpaid)
    expect(JSON.stringify(responseBody.bookingdates)).toBe(JSON.stringify(expectedBody.bookingdates))
    })


  
   test("TC-12 Partial edit of reservation - PATCH", async ({request}) => {
        const patch = {"firstname" : "UpdatedName"};
        const expectedBody = {"firstname" : "UpdatedName",
        "lastname" : "Kaaaa",
        "totalprice" : 300,
        "depositpaid" : false,
        "bookingdates" : {
            "checkin" : "2035-01-01",
            "checkout" : "2040-01-01" }

        }

        const responsePatch = await request.patch(`https://restful-booker.herokuapp.com/booking/${bookingId}`,
        {headers:{Cookie: `token=${token}`},
         data:  patch});
        expect(responsePatch.status()).toBe(200);
        
         const responseGet = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`,
        );
        const responseBody = await responseGet.json();
        expect(responseGet.status()).toBe(200)
        expect(responseBody.firstname).toBe(expectedBody.firstname)
        expect(responseBody.lastname).toBe(expectedBody.lastname)
        expect(responseBody.totalprice).toBe(expectedBody.totalprice)
        expect(responseBody.depositpaid).toBe(expectedBody.depositpaid)
        expect(JSON.stringify(responseBody.bookingdates)).toBe(JSON.stringify(expectedBody.bookingdates))

})

test("TC-13 Full edit of reservation with no authentication - PUT", async ({request}) => {
    const expectedBody = { "firstname" : "Krzysiu",
        "lastname" : "Kaaaa",
        "totalprice" : 300,
        "depositpaid" : false,
        "bookingdates" : {
            "checkin" : "2035-01-01",
            "checkout" : "2040-01-01" }
        };
    const response = await request.put(`https://restful-booker.herokuapp.com/booking/${bookingId}`,
        {data:  expectedBody});

    expect(response.status()).toBe(403);
})

test("TC-14 Full edit of reservation Basic auth - PUT", async ({request}) => {
    const expectedBody = { "firstname" : "Krzysiu",
        "lastname" : "Kaaaa",
        "totalprice" : 300,
        "depositpaid" : false,
        "bookingdates" : {
            "checkin" : "2035-01-01",
            "checkout" : "2040-01-01" }
        };
    const response = await request.put(`https://restful-booker.herokuapp.com/booking/${bookingId}`,
        {headers:{Authorization: `Basic YWRtaW46cGFzc3dvcmQxMjM=`},
         data:  expectedBody});


        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.firstname).toBe(expectedBody.firstname)
        expect(responseBody.lastname).toBe(expectedBody.lastname)
        expect(responseBody.totalprice).toBe(expectedBody.totalprice)
        expect(responseBody.depositpaid).toBe(expectedBody.depositpaid)
        expect(JSON.stringify(responseBody.bookingdates)).toBe(JSON.stringify(expectedBody.bookingdates))
})

test ("TC-15 & TC-16 Delete the reservation", async ({request}) =>{
    const responseDelete = await request.delete(`https://restful-booker.herokuapp.com/booking/${bookingId}`,
    {headers:{Cookie: `token=${token}`},});

     expect(responseDelete.status()).toBe(201)

    const responseGet = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`,
        {})
        expect(responseGet.status()).toBe(404)

})

test ("TC-17 Delete the reservation without authentication", async ({request}) =>{
    const response = await request.delete(`https://restful-booker.herokuapp.com/booking/${bookingId}`,
    {});

    expect(response.status()).toBe(403)
})

test("TC-18 - Full E2E Flow", async ({request}) =>{
let e2etoken;
let e2eBookingId;
const patch = {"additionalneeds" : "Late checkout"}
const resrvationData = { "firstname" : "E2EKuba",
    "lastname" : "E2EBee",
    "totalprice" : 280,
    "depositpaid" : true,
    "bookingdates" : {
        "checkin" : "2035-01-01",
        "checkout" : "2040-01-01" }
            };

const responseAuth = await request.post('https://restful-booker.herokuapp.com/auth',
        {data: { username: "admin", 
            password: "password123" }});

    expect(responseAuth.status()).toBe(200);
    const bodyOfResponseAuth = await responseAuth.json()
    e2etoken =bodyOfResponseAuth.token;

const responseOfCreateReservation = await request.post('https://restful-booker.herokuapp.com/booking',
    {data:  resrvationData });

    expect(responseOfCreateReservation.status()).toBe(200)
    const responseOfCreateReservationBody = await responseOfCreateReservation.json()
    e2eBookingId = responseOfCreateReservationBody.bookingid;
    expect(responseOfCreateReservationBody.booking.firstname).toBe(resrvationData.firstname);
    expect(responseOfCreateReservationBody.booking.lastname).toBe(resrvationData.lastname);
    expect(responseOfCreateReservationBody.booking.totalprice).toBe(resrvationData.totalprice);
    expect(responseOfCreateReservationBody.booking.bookingdates.checkin).toBe(resrvationData.bookingdates.checkin)
    expect(responseOfCreateReservationBody.booking.bookingdates.checkout).toBe(resrvationData.bookingdates.checkout)

const responsePatch = await request.patch(`https://restful-booker.herokuapp.com/booking/${e2eBookingId}`,
        {headers:{Cookie: `token=${e2etoken}`},
         data:  patch});
        expect(responsePatch.status()).toBe(200);

const responseVerifyPatch = await request.get(`https://restful-booker.herokuapp.com/booking/${e2eBookingId}`,
        {});

    expect(responseVerifyPatch.status()).toBe(200)    
    const bodyOfresponseVerifyPatch = await responseVerifyPatch.json();
    expect(bodyOfresponseVerifyPatch.firstname).toBe(resrvationData.firstname);
    expect(bodyOfresponseVerifyPatch.lastname).toBe(resrvationData.lastname);
    expect(bodyOfresponseVerifyPatch.totalprice).toBe(resrvationData.totalprice);
    expect(bodyOfresponseVerifyPatch.bookingdates.checkin).toBe(resrvationData.bookingdates.checkin)
    expect(bodyOfresponseVerifyPatch.bookingdates.checkout).toBe(resrvationData.bookingdates.checkout)
    expect(bodyOfresponseVerifyPatch.additionalneeds).toBe(patch.additionalneeds)

const responseDelete = await request.delete(`https://restful-booker.herokuapp.com/booking/${e2eBookingId}`,
    {headers:{Cookie: `token=${e2etoken}`}});
    
    expect(responseDelete.status()).toBe(201)

const responseVerifyDelete = await request.get(`https://restful-booker.herokuapp.com/booking/${e2eBookingId}`,
        {}); 
        expect(responseVerifyDelete.status()).toBe(404)

})