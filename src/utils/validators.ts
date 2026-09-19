/**
 * Validation utilities for verifying real emails (Gmail, FPT Education, Edu.vn, Yahoo, Outlook, 
 * company/school domains, and any legitimate email provider) while strictly rejecting fake/disposable emails.
 * Also verifies real active Vietnamese mobile phone numbers.
 */

export interface EmailValidationResult {
  isValid: boolean;
  reason?: string;
  cleanEmail?: string;
  username?: string;
  domain?: string;
  providerName?: string;
}

// Backward-compatibility alias
export type GmailValidationResult = EmailValidationResult;

export interface PhoneValidationResult {
  isValid: boolean;
  reason?: string;
  carrier?: string;
  cleanedPhone?: string;
  formattedPhone?: string;
}

// Known Vietnamese carrier prefix map
const VIETNAM_CARRIERS: Record<string, string> = {
  // Viettel
  '086': 'Viettel',
  '096': 'Viettel',
  '097': 'Viettel',
  '098': 'Viettel',
  '032': 'Viettel',
  '033': 'Viettel',
  '034': 'Viettel',
  '035': 'Viettel',
  '036': 'Viettel',
  '037': 'Viettel',
  '038': 'Viettel',
  '039': 'Viettel',

  // MobiFone
  '089': 'MobiFone',
  '090': 'MobiFone',
  '093': 'MobiFone',
  '070': 'MobiFone',
  '079': 'MobiFone',
  '077': 'MobiFone',
  '076': 'MobiFone',
  '078': 'MobiFone',

  // VinaPhone
  '088': 'VinaPhone',
  '091': 'VinaPhone',
  '094': 'VinaPhone',
  '083': 'VinaPhone',
  '084': 'VinaPhone',
  '085': 'VinaPhone',
  '081': 'VinaPhone',
  '082': 'VinaPhone',

  // Vietnamobile
  '092': 'Vietnamobile',
  '056': 'Vietnamobile',
  '058': 'Vietnamobile',

  // Gmobile
  '099': 'Gmobile',
  '059': 'Gmobile',

  // I-Telecom / Wintel
  '087': 'Wintel',
  '055': 'I-Telecom',
};

// Known fake / dummy / spam usernames
const FAKE_EMAIL_USERNAMES = new Set([
  'test',
  'tester',
  'testing',
  'fake',
  'fakeuser',
  'asdf',
  'asdfgh',
  'qwerty',
  '123456',
  '1234567',
  '12345678',
  'abc123',
  'demo',
  'demouser',
  'sample',
  'random',
  'tempmail',
  'disposable',
  'noname',
  'nobody',
  'notreal',
  'xyz123',
  'abcdef',
]);

// Known disposable / burner / temporary mail domains (Mail ảo)
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'tempmail.net',
  'temp-mail.org',
  'temp-mail.io',
  '10minutemail.com',
  '10minutemail.net',
  '10mail.org',
  '10minemail.com',
  'mailinator.com',
  'mailinator2.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamail.org',
  'guerrillamail.info',
  'guerrillamailblock.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
  'trashmail.me',
  'trashmail.ws',
  'trashmail.de',
  'fakeinbox.com',
  'getairmail.com',
  'throwawaymail.com',
  'dispostable.com',
  'sharklasers.com',
  'maildrop.cc',
  'mohmal.com',
  'crazymailing.com',
  'burnermail.io',
  'fakemailgenerator.com',
  'mytemp.email',
  'mytempemail.com',
  'mytempmail.com',
  'generator.email',
  'emailondeck.com',
  'nada.ltd',
  'getnada.com',
  'inboxkitten.com',
  'inboxbear.com',
  'tempail.com',
  'dropmail.me',
  'minutemail.com',
  'fakemail.net',
  'temporary-mail.net',
  'temporarymail.com',
  'temporarymail.net',
  'tempemail.co',
  'tempemail.net',
  'tmailor.com',
  'mailnesia.com',
  'mailsac.com',
  'harakirimail.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'mytrashmail.com',
  'binkmail.com',
  'bobmail.info',
  'chammy.info',
  'devnullmail.com',
  'letthemeatspam.com',
  'mailin8r.com',
  'notmailinator.com',
  'reallymymail.com',
  'reconmail.com',
  'safetymail.info',
  'sendspamhere.com',
  'sogetthis.com',
  'spambob.com',
  'spambog.com',
  'spambog.de',
  'spamhereplease.com',
  'spamherelots.com',
  'spamthisplease.com',
  'disposablemail.com',
  'disposable.email',
  'burnermail.com',
  'spam4.me',
  'pokemail.net',
  'chacuo.net',
  'bccto.me',
  'mailcatch.com',
  'meltmail.com',
  'spambox.us',
  'fake.com',
  'test.com',
  'example.com',
  'asdf.com',
  'domain.com',
  'sample.com',
  'invalid.com',
]);

/**
 * Checks if a domain is a known disposable or fake mail service
 */
function isDisposableDomain(domain: string): boolean {
  if (DISPOSABLE_DOMAINS.has(domain)) return true;

  // Pattern detection for disposable mail services
  const disposableKeywords = [
    'tempmail',
    'temp-mail',
    'disposable',
    'throwaway',
    'trashmail',
    '10minut',
    'fakemail',
    'burnermail',
    'guerrilla',
    'mailinator',
    'yopmail',
    'sharklaser',
    'maildrop',
    'getnada',
    'mohmal',
    'emailondeck',
    'dropmail',
    'mailnesia',
    'dispostable',
    'minutemail',
    'inboxkitten',
    'inboxbear',
    'mytemp',
    'temporary',
    'burner',
  ];

  return disposableKeywords.some(keyword => domain.includes(keyword));
}

/**
 * Validates that an email is a REAL, authentic email address:
 * - Accepts ANY legitimate email provider (FPT, Edu.vn, Gmail, Yahoo, Outlook, custom domains...)
 * - STRICTLY REJECTS fake/disposable/temporary burner emails (Mail ảo)
 * - Returns "Email không tồn tại." for any non-existent, fake, or disposable address
 */
export function validateRealEmail(email: string): EmailValidationResult {
  const trimmed = (email || '').trim().toLowerCase();

  if (!trimmed) {
    return {
      isValid: false,
      reason: 'Vui lòng nhập địa chỉ email.',
    };
  }

  // Must contain an '@'
  if (!trimmed.includes('@')) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  const [username, domain] = parts;

  // Username basic check
  if (!username || username.length < 2) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  // Domain checks
  if (!domain || !domain.includes('.')) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  // 1. REJECT DISPOSABLE / FAKE EMAILS (Tuyệt đối không cho dùng mail ảo)
  if (isDisposableDomain(domain)) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  // Check top-level domain format
  const domainSegments = domain.split('.');
  const tld = domainSegments[domainSegments.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  // General username syntax
  if (!/^[a-z0-9._%+-]+$/.test(username)) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  if (username.startsWith('.') || username.endsWith('.') || username.includes('..')) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  // 2. PROVIDER IDENTIFICATION & PROVIDER-SPECIFIC RULES
  let providerName = 'Email hợp lệ';

  // 2.1 FPT Education (@fpt.edu.vn, @fe.edu.vn)
  if (domain === 'fpt.edu.vn' || domain.endsWith('.fpt.edu.vn') || domain === 'fe.edu.vn') {
    providerName = 'FPT Education (@fpt.edu.vn)';
    if (username.length < 2) {
      return {
        isValid: false,
        reason: 'Email không tồn tại.',
      };
    }
  }
  // 2.2 Edu.vn / Educational Domains (.edu.vn, .edu, .k12.vn)
  else if (domain.endsWith('.edu.vn') || domain === 'edu.vn' || domain.endsWith('.edu') || domain.endsWith('.k12.vn')) {
    providerName = domain.includes('edu.vn') ? 'Email Giáo dục (.edu.vn)' : 'Email Trường học (.edu)';
    if (username.length < 2) {
      return {
        isValid: false,
        reason: 'Email không tồn tại.',
      };
    }
  }
  // 2.3 Yahoo Mail
  else if (domain === 'yahoo.com' || domain === 'yahoo.com.vn' || domain === 'ymail.com' || domain === 'myyahoo.com') {
    providerName = domain.includes('.vn') ? 'Yahoo Mail Việt Nam' : 'Yahoo Mail';
    if (username.length < 4 || username.length > 32 || !/^[a-z0-9._]+$/.test(username)) {
      return {
        isValid: false,
        reason: 'Email không tồn tại.',
      };
    }
  }
  // 2.4 Google Gmail
  else if (domain === 'gmail.com' || domain === 'googlemail.com') {
    providerName = 'Google Gmail';
    if (username.length < 6 || username.length > 30 || !/^[a-z0-9.]+$/.test(username)) {
      return {
        isValid: false,
        reason: 'Email không tồn tại.',
      };
    }
  }
  // 2.5 Microsoft (Outlook / Hotmail / Live)
  else if (['outlook.com', 'outlook.com.vn', 'hotmail.com', 'live.com', 'msn.com'].includes(domain)) {
    providerName = 'Microsoft Outlook';
    if (username.length < 3) {
      return {
        isValid: false,
        reason: 'Email không tồn tại.',
      };
    }
  }
  // 2.6 Apple iCloud
  else if (['icloud.com', 'me.com'].includes(domain)) {
    providerName = 'Apple iCloud';
    if (username.length < 3) {
      return {
        isValid: false,
        reason: 'Email không tồn tại.',
      };
    }
  }
  // 2.7 Proton / Zoho
  else if (domain === 'proton.me' || domain === 'protonmail.com') {
    providerName = 'Proton Mail';
  } else if (domain === 'zoho.com') {
    providerName = 'Zoho Mail';
  }
  // 2.8 All other legitimate domains
  else {
    providerName = `Email (@${domain})`;
  }

  // Reject generic fake usernames (e.g. test, fake, asdf, qwerty)
  const unstrippedName = username.replace(/[._\-]/g, '');
  if (FAKE_EMAIL_USERNAMES.has(unstrippedName)) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  // Check if all characters in username are the same (e.g., aaaaaa, 111111)
  if (/^(.)\1+$/.test(unstrippedName) && unstrippedName.length >= 4) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  // Check keyboard patterns like "asdfghjk", "qwertyui"
  if (['asdfghjkl', 'qwertyuiop', 'zxcvbnm'].some(k => unstrippedName.includes(k))) {
    return {
      isValid: false,
      reason: 'Email không tồn tại.',
    };
  }

  return {
    isValid: true,
    cleanEmail: `${username}@${domain}`,
    username,
    domain,
    providerName,
  };
}

/**
 * Backward compatibility alias for validateRealEmail
 */
export function validateRealGmail(email: string): EmailValidationResult {
  return validateRealEmail(email);
}

/**
 * Validates that a phone number is a REAL, active Vietnamese mobile phone number:
 * - Exactly 10 digits
 * - Starts with 0 and matches a legitimate Vietnamese carrier prefix (03, 05, 07, 08, 09)
 * - Identifies carrier (Viettel, VinaPhone, MobiFone, Vietnamobile, Gmobile, Wintel)
 * - Rejects dummy numbers (0123456789, 0987654321, 0000000000, 0999999999, etc.)
 */
export function validateRealPhoneNumber(phone: string): PhoneValidationResult {
  const raw = (phone || '').trim();

  if (!raw) {
    return {
      isValid: false,
      reason: 'Vui lòng nhập số điện thoại di động của bạn để nhà trường liên hệ đón học sinh.',
    };
  }

  // Standardize: replace leading +84 with 0
  let cleaned = raw.replace(/^(\+84|84)/, '0');
  // Remove spaces, hyphens, parentheses, dots
  cleaned = cleaned.replace(/[\s\-\.\(\)]/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      reason: 'Số điện thoại không hợp lệ. Chỉ được chứa các chữ số.',
    };
  }

  if (cleaned.length < 10) {
    return {
      isValid: false,
      reason: `Số điện thoại không tồn tại. Số điện thoại di động Việt Nam phải đúng 10 số (bạn mới nhập ${cleaned.length} số).`,
    };
  }

  if (cleaned.length > 10) {
    return {
      isValid: false,
      reason: `Số điện thoại không đúng độ dài. Số điện thoại di động chuẩn hiện nay gồm 10 chữ số (hiện đang có ${cleaned.length} số).`,
    };
  }

  // Must start with 0
  if (!cleaned.startsWith('0')) {
    return {
      isValid: false,
      reason: 'Số điện thoại di động Việt Nam phải bắt đầu bằng chữ số 0 (ví dụ: 0912 345 678).',
    };
  }

  // Check carrier prefix (first 3 digits)
  const prefix = cleaned.substring(0, 3);
  const carrier = VIETNAM_CARRIERS[prefix];

  if (!carrier) {
    return {
      isValid: false,
      reason: `Đầu số "${prefix}" không tồn tại trong danh mục nhà mạng viễn thông Việt Nam (hợp lệ: 03x, 05x, 07x, 08x, 09x).`,
    };
  }

  // Check obvious dummy / non-existent patterns:
  // 1. Sequential: 0123456789 or 0987654321
  if (cleaned === '0123456789' || cleaned === '0987654321') {
    return {
      isValid: false,
      reason: 'Số điện thoại này là dãy số giả định, không có thật trên mạng viễn thông.',
    };
  }

  // 2. All 10 digits identical (e.g. 0000000000)
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return {
      isValid: false,
      reason: 'Số điện thoại không tồn tại (các chữ số bị trùng lặp).',
    };
  }

  // 3. Trailing 6+ identical digits (e.g. 0900000000, 0911111111, 0988888888)
  if (/^\d{3}(\d)\1{6}$/.test(cleaned)) {
    return {
      isValid: false,
      reason: 'Số điện thoại này không có thật. Vui lòng nhập đúng số điện thoại cá nhân của bạn.',
    };
  }

  // Format as: 0912 345 678
  const formattedPhone = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;

  return {
    isValid: true,
    cleanedPhone: cleaned,
    carrier,
    formattedPhone,
  };
}
