const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

exports.handler = async () => {
  try {
    await writeTestRowToSheet();
    console.log("[INFO] Successfully wrote test row to Google Sheet");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Test row written to Google Sheet" }),
    };
  } catch (error) {
    console.error("[ERROR] Failed to write test row:", error);
    throw error;
  }
};

async function writeTestRowToSheet() {
  const credentialsPath = path.join(__dirname, "google-sheet.json");

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Google credentials not found: ${credentialsPath}`);
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
  const { client_email, private_key, sheet_id, range, all_range } = credentials;
  const sheetName = range ? range.split("!")[0] : all_range || "Sheet1";

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email, private_key },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({
    version: "v4",
    auth: await auth.getClient(),
  });

  const now = new Date().toISOString();

  const rowData = [
    "TEST_URL_NEW",
    now,
    "TEST_ASSESSMENT_NO",
    "TEST_NAME",
    "TEST_TEL",
    "TEST_EMAIL",
    "TEST_PREFECTURE",
    "TEST_MAKER_NAME",
    "TEST_CAR_NAME",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheet_id,
    range: `${sheetName}!A:Z`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [rowData] },
  });

  console.log("[INFO] Test row appended to sheet:", sheet_id, sheetName);
}
