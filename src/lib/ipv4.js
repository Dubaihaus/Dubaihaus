import 'server-only';
import dns from 'node:dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // ignore if not supported
}
