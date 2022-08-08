const jwt = require("jsonwebtoken");

const getSheetOnly = require('../helper').getSheetOnly;
const { constants } = require('../constants')
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST",
    "content-type": "application/json",
};
const bcrypt = require("bcrypt");
exports.handler = async function (event, context) {
    try {
        if (event.httpMethod == "OPTIONS") {
            return {
                statusCode: 200,
                headers
            }
        }
        if (event.httpMethod == "POST") {
            const { username, password } = JSON.parse(event.body);
            const { sheets, auth } = await getSheetOnly();
            const getRows = await sheets.spreadsheets.values.get({
                auth,
                spreadsheetId: constants.USERS_SHEET_ID,
                range: constants.USERS_SHEET_NAME,
            });
            const usersArray = getRows.data.values;
            usersArray.shift();

            const userExist = usersArray.find((element) => element[0] === username);
            if (!userExist) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: "User does not exist." }),
                };
            }

            const hashedPassword = userExist[1];
            const validPassword = await bcrypt.compare(password, hashedPassword);
            if (!validPassword) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ message: "Wrong password." }),
                };
            }
            const token = await jwt.sign(
                {
                    username: userExist[0],
                    email: userExist[3],
                    fullName: userExist[4],
                    contactNumber: userExist[5],
                    organization: userExist[6],
                    department: userExist[7],
                    grant: userExist[8],
                },
                "e8b87623-c9df-4609-a5d2-463c7efe4058",
                { expiresIn: "2h" }
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Logon success", token }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: `Exception occured: ${error}`,
        };
    }
};
