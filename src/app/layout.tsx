import { type Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css'; 
import './theme.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css';
import Header from '../components/header';
import Script from 'next/script'; 
import 'bootstrap/dist/css/bootstrap.min.css';

// Import your providers
import { WishlistProvider } from '../context/wishlistcontext'; 
import { CartProvider } from '../context/cartcontext'; 

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Jaden Freys Fresh Meat',
  description: 'Jaden Freys Fresh Meat with clerk and mongodb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <WishlistProvider>
            <CartProvider>
              <Header />
              <main>{children}</main>
            </CartProvider>
          </WishlistProvider>
         
          <Script 
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" 
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}