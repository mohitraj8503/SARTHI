export async function sendPushToUser(userId: string, payload: any) {
  console.log('[Push Notification Mock] Sending to', userId, ':', payload.title);
  return { success: true };
}
