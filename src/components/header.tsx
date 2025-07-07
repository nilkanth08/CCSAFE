"use client";

import { WalletCards } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <WalletCards className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-headline font-semibold">CardSafe Keeper</h1>
      </div>
    </header>
  );
};

export default Header;
