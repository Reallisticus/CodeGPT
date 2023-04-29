const Bottleneck = require("bottleneck");
const { logger } = require("../logger");

const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// const limiter = new Bottleneck({
//   minTime: (60 * 1000) / 200, // Set to 200 RPM
// });

// openai.scheduleCall = async <T extends (...args: any[]) => any>(
//   fn: T,
//   ...args: Parameters<T>
// ): Promise<ReturnType<T>> => {
//   return limiter.schedule(() => fn(...args));
// };

// limiter.on("error", (error: Error) => {
//   logger.error(`Bottleneck error: ${error.message}`);
// });

module.exports = openai;
