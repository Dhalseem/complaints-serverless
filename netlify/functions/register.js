const getSheets = require('./complaints').getSheets;
const { google } = require("googleapis");
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "content-type": "application/json",
};
exports.handler = async function (event, context) {

    try {
        console.log(event)
        if (event.httpMethod == "OPTIONS") {
            return {
                statusCode: 200,
                headers
            }
        }
        if (event.httpMethod == 'POST') {

            const tokenValidation = validateToken(event.headers.authorization);
            if (tokenValidation.statusCode) {
                return tokenValidation;
            }
            if (tokenValidation.grant != 'admin') {
                return {
                    statusCode: 401,
                    headers
                }
            }
            const { username, password, email, fullName, contactNumber, organization, department, grant } = JSON.parse(event.body)
            const { sheets, auth } = await getSheetOnly();
            const getRows = await sheets.spreadsheets.values.get({
                auth,
                spreadsheetId,
                range: "Users",
            });
            const usersArray = getRows.data.values;
            usersArray.shift();

            const userExist = usersArray.find(element => element[0] === username);
            if (userExist) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Username is already taken!' }),
                    headers
                }
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            const newRow = [username, hashPassword, salt, email, fullName, contactNumber, organization, department, grant];
            await sheets.spreadsheets.values.append({
                auth,
                spreadsheetId,
                range: "Users",
                valueInputOption: "USER_ENTERED",
                resource: { values: [newRow] }
            });
            const token = await jwt.sign({ username, email, fullName, contactNumber, organization, department, grant }, 'something', { expiresIn: "2h" });
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ message: 'User created!', token }),

            }

        }
    }
    catch (error) {
        return {
            statusCode: 500,
            body: `Exception occured: ${error}`,
            headers
        }
    }

};


