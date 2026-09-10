import '@testing-library/jest-dom';

// Mock TextEncoder/TextDecoder if needed for jose/auth tests
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
