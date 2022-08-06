const getSheets = require('./complaints').getSheets;
const { google } = require("googleapis");
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST'
};
exports.handler = async function (event, context) {

    try {
        if (event.httpMethod == 'POST') {
            const { username, password, email, fullName, contactNumber, organization, department } = JSON.parse(event.body)
            const { sheets, spreadsheetId, auth } = await getSheets(google);
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
                    body: JSON.stringify({ message: 'Username is already taken!' })
                }
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            const grant = 'user'
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
                body: JSON.stringify({ message: 'User created!', token })
            }

        }
    }
    catch (error) {
        return {
            statusCode: 500,
            body: `Exception occured: ${error}`
        }
    }

};


