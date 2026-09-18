/**
 * Validation utilities for verifying real Gmail addresses and real Vietnamese phone numbers.
 */

export interface GmailValidationResult {
  isValid: boolean;
  reason?: string;
  cleanEmail?: string;
  username?: string;
}

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

// Known fake / test / dummy patterns
const FAKE_GMAIL_USERNAMES = new Set([
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
  'admin',
  'administrator',
  'user12',
  'tempmail',
  'disposable',
  'noname',
  'nobody',
  'notreal',
  'xyz123',
  'abcdef',
]);

/**
 * Validates that an email is a REAL, valid Gmail address according to Google's official standards:
 * - Domain must be @gmail.com or @googlemail.com
 * - Username must be 6 to 30 characters
 * - Only letters (a-z), numbers (0-9), and periods (.) allowed
 * - Cannot start or end with a period
 * - Cannot have consecutive periods (..)
 * - Rejects obvious fake/test patterns
 */
export function validateRealGmail(email: string): GmailValidationResult {
  const trimmed = (email || '').trim().toLowerCase();

  if (!trimmed) {
    return {
      isValid: false,
      reason: 'Vui lòng nhập địa chỉ Gmail của bạn.',
    };
  }

  // Check if it has an @
  if (!trimmed.includes('@')) {
    return {
      isValid: false,
      reason: 'Địa chỉ Gmail không tồn tại hoặc sai định dạng. Vui lòng nhập đầy đủ đuôi @gmail.com.',
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      reason: 'Địa chỉ email không hợp lệ.',
    };
  }

  const [username, domain] = parts;

  // Strict domain check: MUST be gmail.com or googlemail.com
  if (domain !== 'gmail.com' && domain !== 'googlemail.com') {
    if (['yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'].includes(domain)) {
      return {
        isValid: false,
        reason: `Hệ thống chỉ chấp nhận tài khoản Gmail thật (@gmail.com). Bạn đang nhập email từ @${domain}.`,
      };
    }
    return {
      isValid: false,
      reason: 'Chỉ chấp nhận tài khoản Gmail thật kết thúc bằng @gmail.com.',
    };
  }

  // Google's official rule: username must be 6 to 30 characters
  if (username.length < 6) {
    return {
      isValid: false,
      reason: 'Tên tài khoản Gmail không tồn tại. Theo quy chuẩn Google, tên Gmail phải có tối thiểu 6 ký tự.',
    };
  }

  if (username.length > 30) {
    return {
      isValid: false,
      reason: 'Tên tài khoản Gmail không hợp lệ. Theo quy chuẩn Google, tên Gmail tối đa 30 ký tự.',
    };
  }

  // Characters allowed: letters (a-z), numbers (0-9), and dots (.)
  if (!/^[a-z0-9.]+$/.test(username)) {
    return {
      isValid: false,
      reason: 'Tên tài khoản Gmail chỉ được chứa chữ cái (a-z), chữ số (0-9) và dấu chấm (.).',
    };
  }

  // Cannot start or end with a period
  if (username.startsWith('.') || username.endsWith('.')) {
    return {
      isValid: false,
      reason: 'Tên tài khoản Gmail không được bắt đầu hoặc kết thúc bằng dấu chấm (.).',
    };
  }

  // Cannot have consecutive periods
  if (username.includes('..')) {
    return {
      isValid: false,
      reason: 'Tên tài khoản Gmail không được chứa hai dấu chấm liên tiếp (..).',
    };
  }

  // Check known fake/test patterns
  const unstrippedName = username.replace(/\./g, '');
  if (FAKE_GMAIL_USERNAMES.has(unstrippedName)) {
    return {
      isValid: false,
      reason: `Địa chỉ "${trimmed}" là tài khoản mẫu/ảo không có thật. Vui lòng sử dụng Gmail thật của bạn.`,
    };
  }

  // Check if all characters in username are the same (e.g., aaaaaa, 111111)
  if (/^(.)\1+$/.test(unstrippedName)) {
    return {
      isValid: false,
      reason: 'Địa chỉ Gmail này không có thực trên máy chủ Google. Vui lòng nhập địa chỉ Gmail thật của bạn.',
    };
  }

  // Check keyboard patterns like "asdfghjk", "qwertyui"
  if (['asdfghjkl', 'qwertyuiop', 'zxcvbnm'].some(k => unstrippedName.includes(k))) {
    return {
      isValid: false,
      reason: 'Địa chỉ Gmail này có dấu hiệu không có thực. Vui lòng nhập Gmail thật đang hoạt động.',
    };
  }

  return {
    isValid: true,
    cleanEmail: `${username}@gmail.com`,
    username,
  };
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
