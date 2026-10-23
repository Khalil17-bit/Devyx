import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");

function readEnv(): Record<string, string> {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const env: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
  return env;
}

function updateEnv(key: string, value: string) {
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  fs.writeFileSync(envPath, content.trim() + "\n", "utf8");
}

async function main() {
  console.log("==================================================");
  console.log("Devyx Telegram Admin Group Setup & Diagnostic");
  console.log("==================================================\n");

  const env = readEnv();
  const tokenArg = process.argv[2]?.trim();
  const token = tokenArg || env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.log("No TELEGRAM_BOT_TOKEN found!");
    console.log("\nStep-by-step instructions:");
    console.log("1. Open Telegram and search for @BotFather");
    console.log("2. Send /newbot and choose a name (e.g. 'Devyx Admin Alerts')");
    console.log("3. Choose a username ending in 'bot' (e.g. 'devyx_alerts_bot')");
    console.log("4. Copy the API Token (e.g. 7123456789:AAH...)");
    console.log("\nThen run:");
    console.log("  npx tsx scripts/setup-telegram.ts YOUR_BOT_TOKEN\n");
    process.exit(1);
  }

  console.log("Checking Bot Identity with Telegram API...");
  const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const meData = await meRes.json();

  if (!meData.ok) {
    console.error("Invalid Bot Token!", meData.description);
    process.exit(1);
  }

  const botUser = meData.result;
  console.log(`Bot Recognized: @${botUser.username} (${botUser.first_name})`);

  // Save token to .env.local
  updateEnv("TELEGRAM_BOT_TOKEN", token);

  console.log("\nLooking for group chat updates via getUpdates...");
  const updatesRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const updatesData = await updatesRes.json();

  if (!updatesData.ok) {
    console.error("Failed to fetch Telegram updates:", updatesData.description);
    process.exit(1);
  }

  const updates = updatesData.result || [];
  const groupUpdates = updates.filter(
    (u: any) =>
      u.message?.chat?.type === "group" ||
      u.message?.chat?.type === "supergroup" ||
      u.my_chat_member?.chat?.type === "group" ||
      u.my_chat_member?.chat?.type === "supergroup"
  );

  let targetChatId = env.TELEGRAM_CHAT_ID;
  let targetChatTitle = "";

  if (groupUpdates.length > 0) {
    const last = groupUpdates[groupUpdates.length - 1];
    const chat = last.message?.chat || last.my_chat_member?.chat;
    targetChatId = String(chat.id);
    targetChatTitle = chat.title || "Admin Group";
    console.log(`Found Telegram Group: "${targetChatTitle}"`);
    console.log(`Chat ID: ${targetChatId}`);
    updateEnv("TELEGRAM_CHAT_ID", targetChatId);
  } else if (targetChatId) {
    console.log(`Using existing TELEGRAM_CHAT_ID from .env.local: ${targetChatId}`);
  } else {
    console.log("No group chat detected yet!");
    console.log("\nPlease do this in Telegram:");
    console.log(`1. Create your admin group in Telegram (or open an existing group).`);
    console.log(`2. Add @${botUser.username} to the group.`);
    console.log(`3. Make the bot an administrator (or give it permission to post messages).`);
    console.log(`4. Send any test message in the group, e.g. "Hello bot!"`);
    console.log(`5. Re-run this script to automatically detect the Group Chat ID!\n`);
    console.log(`Command: npx tsx scripts/setup-telegram.ts ${token}\n`);
    process.exit(0);
  }

  console.log(`\nSending test verification alert to Group ID: ${targetChatId}...`);
  const testPayload = {
    chat_id: targetChatId,
    text:
      `🚨 <b>DEVYX ADMIN TERMINAL CONNECTED!</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ <b>Status:</b> Operational\n` +
      `🤖 <b>Bot:</b> @${botUser.username}\n` +
      `🕒 <b>Connected At:</b> ${new Date().toISOString()}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `All client calls, human handoffs, and conversation summaries will arrive here in real-time with direct one-click WhatsApp & Call shortcuts.`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🌐 Open Devyx Website", url: "http://localhost:3005" },
          { text: "⚙️ Services Matrix", url: "http://localhost:3005/services" },
        ],
      ],
    },
  };

  const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testPayload),
  });

  const sendData = await sendRes.json();
  if (sendData.ok) {
    console.log("TEST ALERT DELIVERED TO TELEGRAM GROUP SUCCESSFULLY! 🎉");
    console.log("Check your Telegram group — you should see the confirmation message with buttons!");
    console.log(`Both TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are saved in .env.local.`);
  } else {
    console.error("Failed to send message to group:", sendData.description);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
