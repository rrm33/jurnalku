import { NextResponse } from 'next/server';

export function middleware(request) {
  const session = request.cookies.get('session');
  const path = request.nextUrl.pathname;

  // Izinkan akses ke API dan aset statis
  if (path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/uploads') || path === '/favicon.ico') {
    return NextResponse.next();
  }

  // Jika belum login, redirect ke /login
  if (!session && (path.startsWith('/beranda') || path.startsWith('/beranda-siswa'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session) {
    try {
      const parsed = JSON.parse(session.value);
      
      // Jika role GURU mencoba akses /beranda-siswa, lempar ke /beranda
      if (parsed.role === 'guru' && path.startsWith('/beranda-siswa')) {
        return NextResponse.redirect(new URL('/beranda', request.url));
      }
      
      // Jika role SISWA mencoba akses /beranda (milik guru), lempar ke /beranda-siswa
      if (parsed.role === 'siswa' && path.startsWith('/beranda') && !path.startsWith('/beranda-siswa')) {
        return NextResponse.redirect(new URL('/beranda-siswa', request.url));
      }

      // Jika sudah login, cegah masuk halaman login
      if (path === '/' || path === '/login') {
        if (parsed.role === 'guru') return NextResponse.redirect(new URL('/beranda', request.url));
        if (parsed.role === 'siswa') return NextResponse.redirect(new URL('/beranda-siswa', request.url));
      }
    } catch (e) {
      // Sesi rusak
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
