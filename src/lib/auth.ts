import { supabase } from './supabase';

function resolveRedirectTo(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return `${siteUrl.replace(/\/$/, '')}/auth/callback`;
  if (typeof window !== 'undefined') return `${window.location.origin}/auth/callback`;
  throw new Error('redirectTo 결정 불가: window도 없고 NEXT_PUBLIC_SITE_URL도 미설정');
}

export async function signInWithKakao() {
  const redirectTo = resolveRedirectTo();
  console.log('[auth] signInWithKakao redirectTo=', redirectTo);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo, scopes: '' },
  });
  console.log('[auth] signInWithKakao result', { data, error });
  if (error) throw error;
  if (!data?.url) throw new Error('Supabase가 OAuth 리다이렉트 URL을 반환하지 않았습니다');
}

export async function signInWithGoogle() {
  const redirectTo = resolveRedirectTo();
  console.log('[auth] signInWithGoogle redirectTo=', redirectTo);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Supabase 환경변수 미설정 (url=${!!supabaseUrl}, key=${!!supabaseKey}). .env.local 확인 필요`,
    );
  }

  // 프리플라이트: Supabase 프로젝트 URL이 실제로 도달 가능한지 확인
  // (supabase-js는 window.location.assign만 하고 에러를 반환하지 않으므로
  //  DNS 실패/프로젝트 중지 시 사용자에겐 "아무 일도 안 일어난 것"처럼 보임)
  try {
    const health = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: supabaseKey },
      signal: AbortSignal.timeout(3000),
    });
    console.log('[auth] supabase health', health.status);
    if (health.status >= 500) {
      throw new Error(`Supabase auth 서버 응답 비정상 (HTTP ${health.status})`);
    }
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Supabase 프로젝트에 연결할 수 없습니다. 프로젝트 URL(${supabaseUrl})이 유효한지, 일시중지 상태가 아닌지 확인하세요. (원인: ${reason})`,
    );
  }

  // skipBrowserRedirect: true 로 URL만 받아서 직접 이동 — 문제 시 에러 UI 노출 가능
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  console.log('[auth] signInWithGoogle result', { data, error });

  if (error) {
    throw new Error(`[Supabase OAuth] ${error.message} (status=${error.status ?? 'n/a'})`);
  }
  if (!data?.url) {
    throw new Error('Supabase가 OAuth 리다이렉트 URL을 반환하지 않았습니다');
  }

  // 여기까지 도달하면 프리플라이트 통과 — 실제로 OAuth 프로바이더로 이동
  window.location.assign(data.url);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}
