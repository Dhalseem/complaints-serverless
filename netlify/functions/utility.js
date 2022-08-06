const getSheets = require('./complaints').getSheets;

const { google } = require("googleapis");
const uuid = require('uuid');

exports.handler = async function (event, context) {
    switch (event.httpMethod) {
        case "POST":
            // function to add ids to the input column
            // input {idRow: "<Row alphabet in sheets>"}
            const { sheets, spreadsheetId, auth } = await getSheets(google);
            const getRows = await sheets.spreadsheets.values.get({
                auth, spreadsheetId,
                range: "Complaints",
            });
            const rows = getRows.data.values;
            rows.shift();
            console.log(rows.length)
            const uuids = []
            rows.forEach(() => {
                uuids.push([uuid.v4().toString()]);
            });
            const payload = JSON.parse(event.body);
            const range = "Complaints!" + payload.idRow + "2:" + payload.idRow + (rows.length + 1).toString();
            response = await sheets.spreadsheets.values.update({
                auth,
                spreadsheetId,
                range,
                valueInputOption: "USER_ENTERED",
                resource: { values: uuids }
            });

            return {
                statusCode: 200,
                body: "Ids appended successfully."
            }

    }
}