
import "dotenv/config";

const key = process.env.FIREBASE_PRIVATE_KEY;
console.log("Key defined:", !!key);
if (key) {
    console.log("Key length:", key.length);
    console.log("Raw JSON:", JSON.stringify(key));
}
