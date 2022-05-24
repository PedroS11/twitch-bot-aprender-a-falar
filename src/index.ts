import "dotenv/config";
import { Client, Userstate } from "@twurple/auth-tmi";
import { RefreshingAuthProvider } from "@twurple/auth";
import { promises as fs, readFileSync } from "fs";

const tokenData = JSON.parse(readFileSync("./tokens.json", "utf-8"));

// const aMuitoTempo = /(?<!h)[áaà] muito tempo/;
// const aXTempo = /(?<!h)[áaà] [A-zÀ-ú0-9]+ (anos?|dias?|horas?|minutos?|semanas?|meses|mês)/;

// const tempoRegex = /((?<!h)[áaà]) [A-zÀ-ú0-9]+ (anos?|dias?|horas?|minutos?|semanas?|meses|mês|tempo)/;
try {
  const authProvider = new RefreshingAuthProvider(
    {
      clientId: process.env.CLIENT_ID as string,
      clientSecret: process.env.CLIENT_SECRET as string,
      onRefresh: async newTokenData =>
        await fs.writeFile("./tokens.json", JSON.stringify(newTokenData, null, 4), "utf-8")
    },
    tokenData
  );
  const client = new Client({
    connection: {
      secure: true,
      reconnect: true
    },
    authProvider: authProvider,
    channels: ["iterm11"]
  });

  client.connect().catch(console.error);

  client.on("message", (channel: string, userstate: Userstate, message: string, self: boolean) => {
    if (self) {
      return;
    }
    let matches: RegExpMatchArray | null = message.match(
      /((?<!h)[áaà]) [A-zÀ-ú0-9]+ (anos?|dias?|horas?|minutos?|semanas?|meses|mês|tempo)/
    );
    if (matches?.length) {
      client.say(channel, `@${userstate.username}, esse '${matches[1]}' é com H, aprende a escrever!`);
      return;
    }

    matches = message.match(/\b\w+es-te\b/i);
    if (matches?.length) {
      const matchedWord: string = matches[0];
      client.say(
        channel,
        `@${userstate.username}, se é passado, escreve-se '${matchedWord.replace("-", "")}' e não '${matchedWord}'!`
      );
      return;
    }
  });
} catch (e) {
  console.log(e);
}
