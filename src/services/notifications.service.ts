import type { UserProfile } from '../types/auth';
import type { TrustedContact } from '../types/contacts';
import type { LocationPoint } from '../types/sos';
import type { NotificationRecord } from '../types/notifications';
import { googleMapsUrl } from '../utils/geo';
import { formatTimestamp } from '../utils/formatters';
import { nanoid } from '../utils/nanoid';

export interface AlertResult {
  contactId: string;
  contactName: string;
  status: 'composer_opened' | 'failed';
  error?: string;
  record: NotificationRecord;
}

/**
 * Builds the SMS body sent to trusted contacts.
 * NEVER claims the SMS was delivered — it only opens the system composer.
 */
function buildAlertMessage(
  user: UserProfile,
  location: LocationPoint | undefined
): string {
  const name = user.displayName || user.email;
  const time = formatTimestamp(Date.now());
  const mapsLink = location
    ? googleMapsUrl(location.latitude, location.longitude)
    : null;

  const lines = [
    `🚨 EMERGENCY ALERT`,
    `${name} has triggered an SOS at ${time}.`,
  ];

  if (mapsLink) {
    lines.push(`📍 Last known location: ${mapsLink}`);
  } else {
    lines.push(`📍 Location not available — please call them immediately.`);
  }

  lines.push(`This message was sent via SOS Guardian.`);
  return lines.join('\n');
}

/**
 * Opens the native SMS composer for all enabled trusted contacts simultaneously.
 *
 * IMPORTANT: This function opens an `sms:` URI — it does NOT send SMS messages
 * directly. The user must press Send in their messaging app. We cannot
 * confirm delivery from within the web app.
 */
export async function notifyContacts(
  user: UserProfile,
  contacts: TrustedContact[],
  location: LocationPoint | undefined
): Promise<AlertResult[]> {
  const enabledContacts = contacts.filter((c) => c.enabled);
  if (enabledContacts.length === 0) return [];

  const body = buildAlertMessage(user, location);
  const results: AlertResult[] = [];
  const now = Date.now();

  // Extract all phone numbers, strip spaces/dashes, and join with commas
  // Android uses ';' sometimes, but ',' is the RFC standard and universally better supported now.
  const phoneNumbers = enabledContacts
    .map((c) => c.phone.replace(/[\s-()]/g, ''))
    .join(',');

  const encodedBody = encodeURIComponent(body);
  
  // iOS has historically had quirks with the query parameter separator.
  // Standard is '?' but some iOS versions require '&'
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? '&' : '?';
  
  const smsUri = `sms:${phoneNumbers}${separator}body=${encodedBody}`;

  try {
    // Open in the same window; the OS will switch to the messaging app
    const a = document.createElement('a'); a.href = smsUri; a.target = '_top'; document.body.appendChild(a); a.click(); document.body.removeChild(a);

    // Record success for all contacts in this bulk message
    for (const contact of enabledContacts) {
      results.push({
        contactId: contact.id,
        contactName: contact.name,
        status: 'composer_opened',
        record: {
          id: nanoid(),
          userId: user.uid,
          sosSessionId: location?.sessionId ?? '',
          contactId: contact.id,
          method: 'sms_composer',
          status: 'composer_opened',
          sentAt: now,
          createdAt: now,
        },
      });
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error opening SMS composer';
    for (const contact of enabledContacts) {
      results.push({
        contactId: contact.id,
        contactName: contact.name,
        status: 'failed',
        error,
        record: {
          id: nanoid(),
          userId: user.uid,
          sosSessionId: location?.sessionId ?? '',
          contactId: contact.id,
          method: 'sms_composer',
          status: 'failed',
          error,
          createdAt: now,
        },
      });
    }
  }

  return results;
}

/**
 * Opens the device dialler with the given emergency number.
 * Does NOT place the call — the user must confirm.
 */
export function openEmergencyCall(number: string): void {
  window.location.href = `tel:${number}`;
}
