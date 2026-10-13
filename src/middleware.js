import { NextResponse } from 'next/server';

function safeParseSession(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

export function middleware(request) {
  const sessionCookie = request.cookies.get('session');
  const path = request.nextUrl.pathname;

  // Izinkan akses ke API dan aset statis
  if (
    path.startsWith('/api') || 
    path.startsWith('/_next') || 
    path.startsWith('/uploads') || 
    path === '/favicon.ico' ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  const session = sessionCookie ? safeParseSession(sessionCookie.value) : null;

  // Jika belum login, redirect ke /login saat mencoba akses beranda
  if (!session && (path.startsWith('/beranda') || path.startsWith('/beranda-siswa'))) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (session) {
    // Jika role GURU mencoba akses /beranda-siswa, lempar ke /beranda
    if (session.role === 'guru' && path.startsWith('/beranda-siswa')) {
      return NextResponse.redirect(new URL('/beranda', request.nextUrl));
    }
    
    // Jika role SISWA mencoba akses /beranda (milik guru), lempar ke /beranda-siswa
    if (session.role === 'siswa' && path.startsWith('/beranda') && !path.startsWith('/beranda-siswa')) {
      return NextResponse.redirect(new URL('/beranda-siswa', request.nextUrl));
    }

    // Jika sudah login, cegah masuk halaman login atau root ('/'), langsung lempar ke beranda masing-masing
    if (path === '/' || path === '/login') {
      if (session.role === 'guru') {
        return NextResponse.redirect(new URL('/beranda', request.nextUrl));
      }
      if (session.role === 'siswa') {
        return NextResponse.redirect(new URL('/beranda-siswa', request.nextUrl));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
