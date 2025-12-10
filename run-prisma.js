const { execSync } = require("child_process");

console.log("Running Prisma Generate...");
execSync("npx prisma generate", { stdio: "inherit" });

console.log("Running Prisma DB Push...");
execSync("npx prisma db push", { stdio: "inherit" });

console.log("Done!");
