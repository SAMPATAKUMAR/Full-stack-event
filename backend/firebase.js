import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve("./firebase-service-account.js"), "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 👇 this is the critical part
export default admin;
