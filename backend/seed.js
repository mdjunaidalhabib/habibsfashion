import fs from "fs";
import dotenv from "dotenv";
import { dbConnect } from "./src/lib/db.js";
import Location from "./src/models/Location.js";

dotenv.config();

async function seed() {
  try {
    await dbConnect(process.env.MONGO_URI);

    // ✅ JSON ফাইল পড়া
    const rawData = fs.readFileSync("./data/bdLocations.json", "utf-8");
    const parsed = JSON.parse(rawData);

    const seedData = [];

    // ✅ বাংলা key থেকে data নেওয়া
    parsed["বিভাগ"].forEach((div) => {
      const divisionName = div["নাম"];

      div["জেলা"].forEach((dist) => {
        const districtName = dist["নাম"];

        dist["উপজেলা"].forEach((upa) => {
          const thanaName = upa["নাম"];

          seedData.push({
            division: divisionName,
            district: districtName,
            thana: thanaName,
          });
        });
      });
    });

    // ✅ DB তে ইনসার্ট
    await Location.deleteMany({});
    await Location.insertMany(seedData);

    console.log("✅ All Locations inserted into DB!");
    process.exit(0);
  } catch (err) {
    console.error("🔥 Seed error:", err);
    process.exit(1);
  }
}

seed();
