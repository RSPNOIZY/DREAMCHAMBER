import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";

import { App, LogLevel } from "@slack/bolt";
import {
  ChannelType,
  Client,
  GatewayIntentBits,
  SendableChannels,
} from "discord.js";

type BridgePair = {
  name: string;
  slackChannelId: string;
  discordChannelId: string;
};

type BridgeConfig = {
  pairs: BridgePair[];
};

type BridgeDirection = "both" | "slack_to_discord" | "discord_to_slack";

type BridgeOptions = {
  direction: BridgeDirection;
  includePermalinks: boolean;
  includeBotMessages: boolean;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function envBool(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new Error(`Invalid boolean for ${name}: expected "true" or "false"`);
}

function envDirection(name: string, defaultValue: BridgeDirection): BridgeDirection {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  if (raw === "both" || raw === "slack_to_discord" || raw === "discord_to_slack") return raw;
  throw new Error(`Invalid ${name}: expected "both", "slack_to_discord", or "discord_to_slack"`);
}

function chunkText(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let remaining = text.trimEnd();

  while (remaining.length > maxLen) {
    const window = remaining.slice(0, maxLen);
    const lastNewline = window.lastIndexOf("\n");
    const cutAt = lastNewline > maxLen * 0.6 ? lastNewline : maxLen;
    chunks.push(remaining.slice(0, cutAt).trimEnd());
    remaining = remaining.slice(cutAt).trimStart();
  }

  if (remaining.length) chunks.push(remaining);
  return chunks;
}

function normalizeSlackLinks(text: string): string {
  // <https://example.com|label> -> [label](https://example.com)
  const withLabeledLinks = text.replace(
    /<(https?:\/\/[^|>]+)\|([^>]+)>/g,
    (_m, url: string, label: string) => `[${label}](${url})`,
  );
  // <https://example.com> -> https://example.com
  return withLabeledLinks.replace(/<(https?:\/\/[^>]+)>/g, (_m, url: string) => url);
}

function normalizeSlackSpecialMentions(text: string): string {
  return text
    .replaceAll("<!here>", "@here")
    .replaceAll("<!channel>", "@channel")
    .replaceAll("<!everyone>", "@everyone");
}

async function loadBridgeConfig(configPath: string): Promise<BridgeConfig> {
  const raw = await fs.readFile(configPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<BridgeConfig>;
  if (!parsed.pairs?.length) throw new Error(`No channel pairs found in ${configPath}`);
  for (const [i, pair] of parsed.pairs.entries()) {
    if (!pair?.name || !pair.slackChannelId || !pair.discordChannelId) {
      throw new Error(`Invalid pair at index ${i} in ${configPath}`);
    }
  }
  return parsed as BridgeConfig;
}

async function main() {
  const options: BridgeOptions = {
    direction: envDirection("BRIDGE_DIRECTION", "both"),
    includePermalinks: envBool("BRIDGE_INCLUDE_PERMALINKS", true),
    includeBotMessages: envBool("BRIDGE_INCLUDE_BOTS", false),
  };

  const discordToken = requireEnv("DISCORD_TOKEN");
  const slackBotToken = requireEnv("SLACK_BOT_TOKEN");
  const slackAppToken = requireEnv("SLACK_APP_TOKEN");

  const configPath = path.resolve(
    process.cwd(),
    process.env.BRIDGE_CONFIG_PATH ?? "bridge.config.json",
  );
  const config = await loadBridgeConfig(configPath);

  const slackToDiscord = new Map<string, BridgePair>();
  const discordToSlack = new Map<string, BridgePair>();
  for (const pair of config.pairs) {
    slackToDiscord.set(pair.slackChannelId, pair);
    discordToSlack.set(pair.discordChannelId, pair);
  }

  const discord = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  function requireDiscordSendableChannel(channel: unknown, channelId: string): SendableChannels {
    if (!channel) throw new Error(`Discord channel not found: ${channelId}`);
    const asChannel = channel as { type?: unknown; send?: unknown };
    if (asChannel.type === ChannelType.DM || asChannel.type === ChannelType.GroupDM) {
      throw new Error(`Discord DMs not supported: ${channelId}`);
    }
    if (typeof asChannel.send !== "function") {
      throw new Error(`Discord channel is not sendable: ${channelId}`);
    }
    return channel as SendableChannels;
  }

  async function sendToDiscord(channelId: string, content: string) {
    const fetched = await discord.channels.fetch(channelId);
    const channel = requireDiscordSendableChannel(fetched, channelId);
    for (const chunk of chunkText(content, 1900)) {
      await channel.send({ content: chunk });
    }
  }

  const slack = new App({
    token: slackBotToken,
    appToken: slackAppToken,
    socketMode: true,
    logLevel: LogLevel.INFO,
  });

  const slackUserCache = new Map<string, string>();
  async function slackUserDisplayName(userId: string | undefined): Promise<string> {
    if (!userId) return "unknown";
    const cached = slackUserCache.get(userId);
    if (cached) return cached;
    const info = await slack.client.users.info({ user: userId, token: slackBotToken });
    const profile = (info.user as any)?.profile ?? {};
    const name =
      profile.display_name ||
      profile.real_name ||
      (info.user as any)?.name ||
      userId;
    slackUserCache.set(userId, name);
    return name;
  }

  async function expandSlackMentions(text: string): Promise<string> {
    const ids = new Set<string>();
    for (const match of text.matchAll(/<@([A-Z0-9]+)>/g)) ids.add(match[1]);
    if (!ids.size) return text;

    let out = text;
    for (const id of ids) {
      const name = await slackUserDisplayName(id);
      out = out.replaceAll(`<@${id}>`, `@${name}`);
    }
    return out;
  }

  function normalizeSlackChannelMentions(text: string): string {
    // <#C123|channel-name> -> #channel-name
    return text.replace(/<#([A-Z0-9]+)\|([^>]+)>/g, (_m, _id: string, name: string) => `#${name}`);
  }

  async function slackPermalink(channel: string, messageTs: string): Promise<string | null> {
    if (!options.includePermalinks) return null;
    const res = await slack.client.chat.getPermalink({
      channel,
      message_ts: messageTs,
      token: slackBotToken,
    });
    const link = (res as any).permalink as string | undefined;
    return link ?? null;
  }

  const slackAuth = await slack.client.auth.test({ token: slackBotToken });
  const slackBotUserId = (slackAuth as any).user_id as string | undefined;

  if (options.direction === "both" || options.direction === "discord_to_slack") {
    discord.on("messageCreate", async (message) => {
      try {
        if (message.author.bot && !options.includeBotMessages) return;
        const pair = discordToSlack.get(message.channelId);
        if (!pair) return;

        let text = message.content ?? "";
        for (const [id, user] of message.mentions.users) {
          text = text.replaceAll(`<@${id}>`, `@${user.username}`);
          text = text.replaceAll(`<@!${id}>`, `@${user.username}`);
        }
        for (const [id, role] of message.mentions.roles) {
          text = text.replaceAll(`<@&${id}>`, `@${role.name}`);
        }
        for (const [id, channel] of message.mentions.channels) {
          const name = (channel as unknown as { name?: unknown } | null)?.name;
          if (typeof name === "string" && name.length) text = text.replaceAll(`<#${id}>`, `#${name}`);
        }

        const attachmentUrls = [...message.attachments.values()].map((a) => a.url);
        const author =
          message.member?.displayName || message.author.globalName || message.author.username;

        const lines: string[] = [
          `*${author}* (Discord/${pair.name})`,
          text.trim() ? text : "",
          attachmentUrls.length ? `Attachments:\n${attachmentUrls.join("\n")}` : "",
          message.url,
        ].filter(Boolean);

        await slack.client.chat.postMessage({
          token: slackBotToken,
          channel: pair.slackChannelId,
          text: lines.join("\n"),
          unfurl_links: false,
          unfurl_media: false,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[discord_to_slack] error", err);
      }
    });
  }

  if (options.direction === "both" || options.direction === "slack_to_discord") {
    slack.event("message", async ({ event }) => {
      try {
        const msg = event as any;
        const pair = slackToDiscord.get(msg.channel);
        if (!pair) return;

        const isBotMessage =
          Boolean(msg.bot_id) ||
          msg.subtype === "bot_message" ||
          (slackBotUserId && msg.user === slackBotUserId);
        if (isBotMessage && !options.includeBotMessages) return;

        // Ignore edits, joins, deletes, etc.
        if (msg.subtype && msg.subtype !== "bot_message") return;

        const rawText = typeof msg.text === "string" ? msg.text : "";
        const files: any[] = Array.isArray(msg.files) ? msg.files : [];
        const fileNames = files
          .map((f) => (f?.name ? `${f.name}${f.url_private ? ` (${f.url_private})` : ""}` : null))
          .filter(Boolean) as string[];

        let text = rawText;
        text = normalizeSlackSpecialMentions(text);
        text = normalizeSlackLinks(text);
        text = normalizeSlackChannelMentions(text);
        text = await expandSlackMentions(text);

        const author = await slackUserDisplayName(msg.user);
        const header = `**${author}** (Slack/${pair.name})`;

        const link = msg.ts ? await slackPermalink(msg.channel, msg.ts) : null;
        const lines: string[] = [
          header,
          text.trim() ? text : "",
          fileNames.length ? `Files:\n${fileNames.join("\n")}` : "",
          link ?? "",
        ].filter(Boolean);

        await sendToDiscord(pair.discordChannelId, lines.join("\n"));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[slack_to_discord] error", err);
      }
    });
  }

  await Promise.all([
    discord.login(discordToken),
    slack.start(),
  ]);

  // eslint-disable-next-line no-console
  console.log(
    `DreamChamber Bridge online. Direction=${options.direction}. Pairs=${config.pairs.length}.`,
  );
}

await main();
