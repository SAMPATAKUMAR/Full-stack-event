import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccount = JSON.parse(
fs.readFilesync(path.resolve("backend/firebase-service-account.js"), "utf-8")
);

admin. initializeApp({
credential: admin. credential.cert(serviceAccount),
});

export default admin;