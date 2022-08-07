const jwt = require('jsonwebtoken');

const getSheetOnly = require('../helper').getSheetOnly;
const { constants } = require('../constants');

const validateToken = require('../helper').validateToken;

const bcrypt = require('bcrypt');
exports.handler = async function (event, context) {

    try {
        if (event.httpMethod == 'POST') {

            const tokenValidation = validateToken(event.headers.authorization);
            if (tokenValidation.statusCode) {
                return tokenValidation;
            }
            if (tokenValidation.grant != 'admin') {
                return {
                    statusCode: 401,
                }
            }
            const { username, password, email, fullName, contactNumber, organization, department, grant } = JSON.parse(event.body)
            const { sheets, auth } = await getSheetOnly();
            const getRows = await sheets.spreadsheets.values.get({
                auth,
                spreadsheetId: constants.USERS_SHEET_ID,
                range: constants.USERS_SHEET_NAME,
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

            const newRow = [username, hashPassword, salt, email, fullName, contactNumber, organization, department, grant];
            await sheets.spreadsheets.values.append({
                auth,
                spreadsheetId: constants.USERS_SHEET_ID,
                range: constants.USERS_SHEET_NAME,
                valueInputOption: "USER_ENTERED",
                resource: { values: [newRow] }
            });
            const token = await jwt.sign({ username, email, fullName, contactNumber, organization, department, grant }, 'e8b87623-c9df-4609-a5d2-463c7efe4058', { expiresIn: "2h" });
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


