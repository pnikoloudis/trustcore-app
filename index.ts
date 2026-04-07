import readline from "readline";
import fs from "fs";
import path from "path";
import chalk from "chalk"; // Add color support

// Paths
const resultsFile = path.resolve("./trustcore-results.json");
const demoLogFile = path.resolve("./trustcore-demo.log");

// Interface
interface TrustCoreEntry {
  id: number;
  transactions: number;
  contracts: number;
  reputation: number;
  trustScore: number;
}

// Readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Demo log array
const demoLog: string[] = [];

function logDemo(message: string, type: "prompt" | "input" | "output" = "output") {
  let formatted = message;
  switch (type) {
    case "prompt":
      formatted = chalk.cyan(message);
      break;
    case "input":
      formatted = chalk.yellow(`> ${message}`);
      break;
    case "output":
      formatted = chalk.green(message);
      break;
  }
  console.log(formatted);
  // Store uncolored version for log file
  demoLog.push(message);
}

// Helper: ask number with validation
function askNumber(question: string, min = 0, max = Infinity): Promise<number> {
  return new Promise((resolve) => {
    rl.question(question, (input) => {
      logDemo(question, "prompt");
      logDemo(input, "input");

      const value = Number(input);
      if (isNaN(value) || value < min || value > max) {
        logDemo(`⚠️  Invalid input. Enter a number between ${min}-${max}.`, "output");
        resolve(askNumber(question, min, max));
      } else {
        resolve(value);
      }
    });
  });
}

// TrustScore calculation
function calculateTrustScore(transactions: number, contracts: number, reputation: number): number {
  return transactions * 0.4 + contracts * 0.4 + reputation * 0.2;
}

// Save results to JSON
function saveResults(entries: TrustCoreEntry[]) {
  fs.writeFileSync(resultsFile, JSON.stringify(entries, null, 2));
  logDemo(`\n✅ Results saved to ${resultsFile}\n`, "output");
}

// Save formatted demo log
function saveDemoLog() {
  const formattedLog = demoLog.map((line) => line.replace(/\x1b\[[0-9;]*m/g, "")).join("\n");
  fs.writeFileSync(demoLogFile, formattedLog);
  logDemo(`✅ Formatted demo log saved to ${demoLogFile}`, "output");
}

// Main loop
async function main() {
  logDemo("🌿 Welcome to TrustCore CLI Contest Edition!\n", "output");

  const allEntries: TrustCoreEntry[] = [];
  let continueEntering = true;
  let idCounter = 1;

  while (continueEntering) {
    const transactions = await askNumber("Number of transactions: ", 0);
    const contracts = await askNumber("Number of smart contracts interacted with: ", 0);
    const reputation = await askNumber("Reputation score (1-100): ", 1, 100);

    const trustScore = calculateTrustScore(transactions, contracts, reputation);

    const entry: TrustCoreEntry = {
      id: idCounter++,
      transactions,
      contracts,
      reputation,
      trustScore,
    };

    logDemo("\n💡 TrustCore Summary:", "output");
    logDemo(`ID: ${entry.id}`, "output");
    logDemo(`Transactions: ${transactions}`, "output");
    logDemo(`Contracts: ${contracts}`, "output");
    logDemo(`Reputation: ${reputation}`, "output");
    logDemo(`TrustScore: ${trustScore.toFixed(2)}\n`, "output");

    allEntries.push(entry);

    const again = await askNumber("Add another entry? (1 = Yes, 0 = No): ", 0, 1);
    continueEntering = again === 1;
  }

  saveResults(allEntries);
  saveDemoLog();
  rl.close();
}

main();