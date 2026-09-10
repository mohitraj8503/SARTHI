export async function queueEmail(payload: any) {
  console.log('[Email Queue Mock] Queuing email:', payload.subject);
  return { success: true, message: 'Email queued (mock)' };
}

export async function processEmailQueue() {
  console.log('[Email Queue Mock] Processing queue (noop)');
  return { success: true, processed: 0 };
}
