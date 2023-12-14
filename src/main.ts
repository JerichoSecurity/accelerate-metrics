#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { DateTime } from "luxon";
import { generateReport } from "./report.js";
import Heroku from "heroku-client";

// Define an interface for the expected command line arguments
interface CommandLineArgs {
  heroku_api_token: string;
  heroku_app_name: string;
  report_end_date: string;
  report_timeframe: number;
}

// Parse command line arguments and assert their type
const argv = yargs(hideBin(process.argv))
  .usage(
    "Usage: $0 --heroku_api_token [string] --heroku_app_name [string] --report_end_date [string] --report_timeframe [num]"
  )
  .option("heroku_api_token", {
    describe: "Heroku API token",
    type: "string",
    demandOption: true,
  })
  .option("heroku_app_name", {
    describe: "Heroku app name",
    type: "string",
    demandOption: true,
  })
  .option("report_end_date", {
    describe: "End date for the report in ISO format",
    type: "string",
    default: DateTime.fromJSDate(new Date()).endOf("day").toISO(),
  })
  .option("report_timeframe", {
    describe: "Timeframe for the report in months",
    type: "number",
    default: 1,
  })
  .help()
  .alias("help", "h").argv as unknown as CommandLineArgs;

async function run() {
  const herokuClient = new Heroku({ token: argv.heroku_api_token });
  const reportFileName = "./report.html";

  const reportEnd = DateTime.fromISO(argv.report_end_date);
  const reportStart = reportEnd.minus({ months: argv.report_timeframe });

  const reportParams = {
    herokuAppName: argv.heroku_app_name,
    reportFileName,
    reportStart,
    reportEnd,
    samplingFrequency: { days: 3 },
    sampleWindowSize: { days: 30 },
  };

  try {
    await generateReport(reportParams, herokuClient);
    console.log(
      `New report generated successfully. Available at ${reportFileName}`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
