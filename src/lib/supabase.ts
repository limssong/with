import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (typeof window !== 'undefined') {
  const keyLooksValid = supabaseAnonKey.startsWith('eyJ');
  // eslint-disable-next-line no-console
  console.log('[supabase] init', {
    urlPresent: Boolean(supabaseUrl),
    url: supabaseUrl || '(missing)',
    keyPresent: Boolean(supabaseAnonKey),
    keyPrefix: supabaseAnonKey ? supabaseAnonKey.slice(0, 8) + '…' : '(missing)',
    keyLooksLikeJwt: keyLooksValid,
  });
  if (!keyLooksValid && supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn(
      '[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY 형식이 JWT(eyJ...)가 아닙니다. Supabase 대시보드 > Settings > API에서 anon public 키를 다시 확인하세요.',
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
