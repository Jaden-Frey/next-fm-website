import { type Metadata } from 'next';
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const Header = () => {
  return (
    <nav className="flex justify-between p-4 bg-white shadow-sm border-b">
      <div className="font-bold text-xl">Jaden Frey's Fresh Meat</div>
      <ul className='flex gap-4 items-center'>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </ul>
    </nav>
  );
};

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
          {/* Use the component we defined above */}
          <Header /> 
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}