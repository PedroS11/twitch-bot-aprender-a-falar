import "dotenv/config";
import { Client, Userstate } from "@twurple/auth-tmi";
import { RefreshingAuthProvider } from "@twurple/auth";
import { promises as fs, readFileSync } from "fs";
import { getEnvironmentVariable } from "./utils/getEnvironmentVariable";
import { Options } from "@twurple/auth-tmi/lib/client";

const tokenData = JSON.parse(readFileSync("./tokens.json", "utf-8"));
const botAccount: string = getEnvironmentVariable("BOT_ACCOUNT");

const authProvider = new RefreshingAuthProvider(
  {
    clientId: getEnvironmentVariable("CLIENT_ID"),
    clientSecret: getEnvironmentVariable("CLIENT_SECRET"),
    onRefresh: async newTokenData => await fs.writeFile("./tokens.json", JSON.stringify(newTokenData, null, 4), "utf-8")
  },
  tokenData
);

const client: Client = new Client({
  options: { debug: true, messagesLogLevel: "info" },
  connection: {
    secure: true,
    reconnect: true
  },
  authProvider: authProvider,
  channels: [getEnvironmentVariable("CHANNEL")]
} as Options);

// @ts-ignore
client.log.setLevel("warn");

client.connect().catch(console.error);

client.on("message", async (channel: string, userstate: Userstate, message: string, self: boolean) => {
  try {
    if (self || userstate.username === botAccount) {
      return;
    }

    // Twitch doesn't allow messages being sent quickly
    await new Promise(r => setTimeout(r, 1000));

    let matches: RegExpMatchArray | null = message.match(
      /((?<!h)[áaà]) [A-zÀ-ú0-9]+ (anos?|dias?|horas?|minutos?|semanas?|meses|mês|tempo)/
    );
    if (matches?.length) {
      await client.say(channel, `@${userstate.username}, esse '${matches?.[1]}' é com H, aprende a escrever!`);
      return;
    }

    matches = message.match(/\b\w+es-te\b/i);
    if (matches?.length) {
      const matchedWord: string = matches[0];
      await client.say(
        channel,
        `@${userstate.username}, se é passado, escreve-se '${matchedWord.replace("-", "")}' e não '${matchedWord}'!`
      );

      return;
    }
  } catch (e) {
    console.log(e);
  }
});
