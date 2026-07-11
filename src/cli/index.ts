import { Command } from "commander";
import fs from "fs";
import path from "path";

const program = new Command();

program
  .name("review-tool")
  .description("AI powered code reviewer")
  .version("1.0.0");
program
  .command("review <file>")
  .description("Review a code file using AI")
  .action(async (file: string) => {
    const filePath = path.resolve(file);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const code = fs.readFileSync(filePath, "utf-8");
    const ext = path.extname(file).replace(".", "");

    console.log(`Reviewing ${file}...`);

    try {
        const PORT = process.env.PORT || 8000;
      const response = await fetch(`http://localhost:${PORT}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: ext }),
      });

      const data = (await response.json()) as any;

      console.log("\n========== CODE REVIEW ==========");
      console.log(`Language : ${data.language}`);
      console.log(`Summary  : ${data.review.summary}`);

      console.log("\n--- Bugs ---");
      if (data.review.bugs.length === 0) {
        console.log("No bugs found!");
      } else {
        data.review.bugs.forEach((bug: any, i: number) => {
          console.log(`${i + 1}. [${bug.line}] ${bug.issue}`);
          console.log(`   Fix: ${bug.fix}`);
        });
      }

      console.log("\n--- Improvements ---");
      data.review.improvements.forEach((imp: any, i: number) => {
        console.log(`${i + 1}. ${imp.suggestion}`);
        console.log(`   Why: ${imp.reason}`);
      });

      console.log("\n--- Quality ---");
      console.log(`Score   : ${data.review.quality.scores}/10`);
      console.log(`Comment : ${data.review.quality.comment}`);
      console.log("==================================\n");
    } catch (error) {
      console.error("Failed to get review. Is your server running?");
      process.exit(1);
    }
  });

program.parse();
