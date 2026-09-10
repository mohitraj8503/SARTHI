import { google } from 'googleapis';
import { prisma } from './prisma';
import { decrypt, encrypt } from './encryption';

const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

export const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export function getAuthUrl(origin?: string) {
  const redirectUri = origin 
    ? `${origin}/api/auth/google/callback` 
    : REDIRECT_URI;
  const client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri);
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    prompt: 'consent'
  });
}

export async function getTokens(code: string, origin?: string) {
  const redirectUri = origin 
    ? `${origin}/api/auth/google/callback` 
    : REDIRECT_URI;
  const client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri);
  const { tokens } = await client.getToken(code);
  return tokens;
}

/**
 * Gets a fresh, authenticated Google Calendar client for a user
 */
export async function getCalendarClient(userId: string) {
  const connection = await prisma.calendarConnection.findUnique({
    where: { userId }
  });

  if (!connection || !connection.accessToken) {
    return null;
  }

  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  
  auth.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: connection.expiresAt.getTime()
  });

  // Handle Token Refreshing
  auth.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await prisma.calendarConnection.update({
        where: { userId },
        data: {
          accessToken: tokens.access_token,
          expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000)
        }
      });
    }
  });

  return google.calendar({ version: 'v3', auth });
}

export async function createCalendarEvent(userId: string, eventDetails: {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  meetingLink?: string;
}) {
  const calendar = await getCalendarClient(userId);
  if (!calendar) return null;

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: eventDetails.title,
      description: eventDetails.description,
      start: { dateTime: eventDetails.startTime.toISOString() },
      end: { dateTime: eventDetails.endTime.toISOString() },
      location: eventDetails.meetingLink,
      conferenceData: eventDetails.meetingLink ? {
        createRequest: { requestId: `tt_${Date.now()}` }
      } : undefined
    },
    conferenceDataVersion: 1
  });

  return res.data.id;
}

export async function updateCalendarEvent(userId: string, googleEventId: string, eventDetails: {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
}) {
  const calendar = await getCalendarClient(userId);
  if (!calendar) return null;

  await calendar.events.patch({
    calendarId: 'primary',
    eventId: googleEventId,
    requestBody: {
      summary: eventDetails.title,
      description: eventDetails.description,
      start: { dateTime: eventDetails.startTime.toISOString() },
      end: { dateTime: eventDetails.endTime.toISOString() },
    }
  });
}

export async function deleteCalendarEvent(userId: string, googleEventId: string) {
  const calendar = await getCalendarClient(userId);
  if (!calendar) return null;

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: googleEventId
  });
}

export async function syncCalendarEvents(userId: string) {
  const calendar = await getCalendarClient(userId);
  if (!calendar) return [];

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  return res.data.items || [];
}
