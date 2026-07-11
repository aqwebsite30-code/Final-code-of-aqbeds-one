import { db } from "./src/lib/db.js";
async function main() {
  const admin = await db.adminUser.findFirst();
  console.log(admin);
}
main();
