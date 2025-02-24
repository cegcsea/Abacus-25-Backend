import bcrypt from "bcrypt"

async function generateHash() {
    const saltRounds = 10; // Adjust as needed
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash('Test@123', salt);
    console.log(hash);
}

generateHash();
