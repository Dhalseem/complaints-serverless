const { google } = require("googleapis");
const jwt = require('jsonwebtoken');

exports.getSheetOnly = async () => {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            "type": "service_account",
            "project_id": "orbital-nova-356415",
            "private_key_id": "4c02c4f0403cc07fba08624c8ac194ef50ee62f1",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7EWCEeivVj9tg\nwPh9D3VabteNfdVC49/ZyDEFkn5Sfi/ZhfewcLXC+XDFDitD9slBQQgfQ+6dfTXO\n4p3dfqezUQAWnkeDkCL81pfzCZKlcMj649xq3Falo09HcXJPvTcRgNza8lYZ7pv6\nzRFf5zVHit7i1NFGh9k8sAFAn28XWX9fT4ue05hbBH//SsykK2lWJ6khbP7fXweR\nDEV/caK6fsH+UJUeJFNQf8bdKfe+3LLhcp81GdMQUkt/PUvxFjaMrNH9kgXRlElP\nq/Eq6/HmLIRqQZmk7N4VY5R9MzYtgOYkSzFSLklvwjdILDRIKtFMo7TEtNt/ykFi\nHwFcZtINAgMBAAECggEACAvoTep/ZjFI63GBfseicaBg7zohaT4qC9EborS5cEzz\nO/USQWmnt9pI6oEAhWzhHUhx0/51DhsrrFl9FuDyz7jFOzPVuagCiUOlx5N61ljy\nnDAe9A3EQF209ErB8wIdk0gqt9RCtdzYosIdZDWqyggELFehJNqFEqIze5cgDS3+\ndcq/9I3fmgCi/1nQudUxphA3smsyKvMqZQf0Zp8ZDQODBdztXuTna85+XT8QmWdo\nqkL/nL7n3vUn0DtNKvWbmb3Ehmf7eyukyHSGzG37+1w9C+y9LDLQ9qqvoOO+ylBX\nMw7LzbSEzdNcAFYSTv0X5LdJLhLd+EailX2Ef3YNIQKBgQDsVo96Pz1/Iy/fpXVS\nfFleaiwvzZJOVrZbQrbEfouTX1RP27Cbv/SueJcsUceFnQgpygHyKCl8lKgZJ6N1\n+7L5SxusgkQZV1fnMpF4Pn822w+xivQi/3akQjS5q8xwudExyyLGTqitX/yimaci\nZrwCtVCN5j4nHXdpHtJ9tIV6NQKBgQDKoXpBkS93ZtmHve0U10b3GfINHL2qzKWl\nHSw8Y0tBM7PAMyhDH66paQjTmSYpE5Jq+MavzFL+rhAzH9TrGBktJo/xETCCwg6e\nOPRmIR2YgOBORXxnk8Ehn/8mxo+TOjCzxGhczS/WJnXFv36+yCaH9NhiC8ZX1VPy\nfwtP5QmzeQKBgCPDMXDhMvATJgJkqi0yLd/QlyEgrVv3WR7UKI3xTDOfwEVZTA81\na9Qe4VlOgq+gRIT2UXcQRr7YS9uKmPyYesuoZuaiy6U+B0ov571XT67AVU6bZTgK\niixu7EWQTp5cL+CmCXwSmQmrNbJxJ85X12ldgHQIfC01E0Wv6VAmSfBlAoGAQD1L\nTggiPT9tDVzIEchiJiqik0eeVczFYwBJqudrz0L95JwTUpxzuh+jfbna4EDlNWaj\nTs5/LWCvoBWiYdnk+Wx1S97AO2QcUEsMKGitQlDxS785vniYTPm1YWynzewvzn4g\n+/LNDJ5qzgN0wjUgChA0nXjQK75k+8cNJgodtjkCgYBWMdIEcqvXeuADpe1EyLCL\nbyB4oLDtiHsN9ppP79j+BsQxUtz8V+cprvqGuxWl/dEyIdexvGKI34XjOTqciFQ+\nz5DhebpPSvUzfhlsvK4gYvpm+PnP0ShCaBmgkYqQwhT8U6JnZWebqO4u8mYWX86o\nZFk+NzxfjBa4aNWL+UXwMQ==\n-----END PRIVATE KEY-----\n",
            "client_email": "sheets-access@orbital-nova-356415.iam.gserviceaccount.com",
            "client_id": "118436976692647487696",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/sheets-access%40orbital-nova-356415.iam.gserviceaccount.com"
        }
        ,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    return { sheets, auth };
}
/**
 * 
 * @param {*} token token string e.g., 'Bearer <jwt_token>'
 * @returns 
 */
exports.validateToken = (token) => {
    try {
        token = token.slice(7);
        const decoded = jwt.verify(token, 'e8b87623-c9df-4609-a5d2-463c7efe4058');
        if (new Date().getTime() > new Date(decoded.exp * 1000).getTime()) {
            return {
                statusCode: '400',
                body: JSON.stringify({ message: 'token is expired' })
            }
        }
        return decoded;
    }
    catch (error) {
        return {
            statusCode: '500',
            body: JSON.stringify({ message: `Exception: ${error}` })
        }
    }
}