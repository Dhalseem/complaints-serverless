const { google } = require("googleapis");

exports.handler = async function (event, context) {
    const { sheets, spreadsheetId, auth } = await getSheets();

    // read rows from spreadsheet
    const getRows = await sheets.spreadsheets.values.get({
        auth, spreadsheetId,
        range: "Complaints",
    });
    return {
        statusCode: 200,
        body: JSON.stringify(getRows.data.values),
    };
}

const getSheets = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    // create client instance
    const client = await auth.getClient();

    // create instance of sheets api
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1QKWnUq_fZpdRZAYBNjkNDzyuUCtQqR0s7eDIF7LJ1GA";
    return { sheets, spreadsheetId, auth };
}