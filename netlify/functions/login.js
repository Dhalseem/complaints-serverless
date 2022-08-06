const getSheets = require("./complaints").getSheets;
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST",
};
exports.handler = async function (event, context) {
    try {
        if (event.httpMethod == "POST") {
            const { username, password } = JSON.parse(event.body);
            const { sheets, spreadsheetId, auth } = await getSheets(google);
            const getRows = await sheets.spreadsheets.values.get({
                auth,
                spreadsheetId,
                range: "Users",
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
                "something",
                { expiresIn: "2h" }
            );

            return {
                statusCode: 200,
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
