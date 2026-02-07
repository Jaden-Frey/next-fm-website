import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const Header = () => {  
  return (
    <nav className="flex justify-between p-4 bg-white shadow-sm">
      <div className="font-bold text-xl">My Store</div>
      
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
}

export default Header; 