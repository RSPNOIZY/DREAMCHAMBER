export interface ShowAnnouncement {
  showName: string;
  status: 'LIVE' | 'OFFLINE';
  platform: string;
  streamUrl?: string;
}

export async function postDiscordAnnouncement(
  webhookUrl: string,
  announcement: ShowAnnouncement
): Promise<void> {
  const isLive = announcement.status === 'LIVE';
  const time = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  const content = isLive
    ? `🚀 **LIVE**\n🎛️ **Show:** ${announcement.showName}\n🌐 **Platform:** ${announcement.platform}\n🕒 **Time:** ${time}${announcement.streamUrl ? `\n🔗 **Watch:** ${announcement.streamUrl}` : ''}`
    : `📴 **OFFLINE**\n🎛️ **Show:** ${announcement.showName}\n🌐 **Platform:** ${announcement.platform}\n🕒 **Ended:** ${time}`;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Noizy.AI',
      avatar_url: 'https://noizy.ai/logo.png',
      content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status} ${await response.text()}`);
  }
}
