const fs = require("fs");
const path = require("path");

// folder where your day-XXX.json files are
const folderPath = "./questions"; // 🔥 adjust if needed

const files = fs.readdirSync(folderPath);

let rows = [];

// header
rows.push([
  "book","chapter","reference","question",
  "option_a","option_b","option_c","option_d",
  "correct_answer","difficulty","tags","day"
].join(","));

files.forEach(file => {
  if (!file.endsWith(".json")) return;

  const data = JSON.parse(
    fs.readFileSync(path.join(folderPath, file), "utf8")
  );

  data.forEach(q => {
    const row = [
      q.book,
      q.chapter,
      q.reference,
      `"${q.question.replace(/"/g, '""')}"`,
      `"${q.option_a.replace(/"/g, '""')}"`,
      `"${q.option_b.replace(/"/g, '""')}"`,
      `"${q.option_c.replace(/"/g, '""')}"`,
      `"${q.option_d.replace(/"/g, '""')}"`,
      q.correct_answer,
      q.difficulty,
      `"${q.tags.join("|")}"`, // 🔥 important
      q.day
    ];

    rows.push(row.join(","));
  });
});

// write CSV
fs.writeFileSync("questions.csv", rows.join("\n"));

console.log("✅ CSV GENERATED: questions.csv");