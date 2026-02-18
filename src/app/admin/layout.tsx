'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoaded } = useUser();

  const navLinks = [
    { href: '/admin/reports', icon: 'bi-bar-chart-line', label: 'Report Summary' },
  ];

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/startbootstrap-sb-admin@7.0.7/dist/css/styles.min.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      <div className="sb-nav-fixed">
        <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
          <Link className="navbar-brand ps-3 fw-bold text-truncate" href="/admin/reports">
            <i className="bi bi-shop me-2"></i> Jaden Frey's
          </Link>
          
          <button className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0 text-white" id="sidebarToggle">
            <i className="bi bi-list fs-5"></i>
          </button>
          
          <div className="ms-auto"></div>
          
          <div className="d-flex align-items-center me-3 me-lg-4">
            {isLoaded && <UserButton afterSignOutUrl="/" />}
          </div>
        </nav>

        <div id="layoutSidenav">
          <div id="layoutSidenav_nav">
            <nav className="sb-sidenav accordion sb-sidenav-dark">
              <div className="sb-sidenav-menu">
                <div className="nav">
                  <div className="sb-sidenav-menu-heading">Analytics</div>
                  {navLinks.map(({ href, icon, label }) => (
                    <Link key={href} href={href} className={`nav-link ${pathname === href ? 'active' : ''}`}>
                      <div className="sb-nav-link-icon"><i className={`bi ${icon}`}></i></div>
                      {label}
                    </Link>
                  ))}
                  
                  <div className="sb-sidenav-menu-heading">Store</div>
                  <Link href="/" className="nav-link">
                    <div className="sb-nav-link-icon"><i className="bi bi-arrow-left-circle"></i></div>
                    Back to Landing Page
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          <div id="layoutSidenav_content">
            <main>{children}</main>
            <footer className="py-4 bg-light mt-auto">
              <div className="container-fluid px-4">
                <div className="small text-muted">
                  &copy; {new Date().getFullYear()} Jaden Frey's Fresh Meat — Admin Panel
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/startbootstrap-sb-admin@7.0.7/dist/js/scripts.js" defer></script>
    </>
  );
}