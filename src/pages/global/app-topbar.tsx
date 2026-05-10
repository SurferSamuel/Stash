import { AddAccountDialog } from "@/components/accounts/add-account-dialog";
import { useSelectedAccounts } from "@/contexts/selected-accounts-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { platform } from "@tauri-apps/plugin-os";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { useState } from "react";
import { useKBar } from "kbar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AppTopbar = () => (
  <header className="sticky flex justify-between h-(--header-height) shrink-0 border-b items-center px-4">
    <SearchBar />
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="-space-x-3 p-0 border-0 rounded-full hover:bg-transparent! aria-expanded:bg-transparent!">
          <AccountTriggerContent />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 max-h-[60vh]" align="end" sideOffset={22}>
        <AccountDropdownContent />
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
);

const SearchBar = () => {
  const currentPlatform = platform();
  const { query } = useKBar();
  return (
    <Button variant="outline" className="sm:w-88 md:w-100 xl:w-120" onClick={() => query.toggle()}>
      <Search />
      <h2 className="mr-auto text-[0.925rem] font-light">Search stocks, etfs, and more...</h2>
      <Kbd>{currentPlatform == "macos" ? "⌘" : "Ctrl"}</Kbd>
      <Kbd>K</Kbd>
    </Button>
  );
};

const AccountTriggerContent = () => {
  const { selectedAccounts } = useSelectedAccounts();
  const visibleAvatars = selectedAccounts.slice(0, 3);
  const overflowCount = selectedAccounts.length > 3 ? selectedAccounts.length - 3 : 0;

  // User hasn't made any accounts yet
  if (selectedAccounts.length === 0) {
    return (
      <Avatar className="size-10">
        <AvatarFallback>
          <Plus />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <>
      {visibleAvatars.map((account) => (
        <Avatar className="size-10" key={account.account_id}>
          <AvatarFallback>{getInitials(account.name)}</AvatarFallback>
        </Avatar>
      ))}
      {overflowCount > 0 && (
        <Avatar className="size-10">
          <AvatarFallback>+{overflowCount}</AvatarFallback>
        </Avatar>
      )}
    </>
  );
};

const AccountDropdownContent = () => {
  const { accounts, selectedIds, toggleAccount, isError, isLoading } = useSelectedAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <p className="text-muted-foreground">Loading accounts...</p>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive">Failed to load accounts.</p>
    );
  }

  return (
    <>
      <DropdownMenuItem onSelect={(e) => {
        e.preventDefault();
        setDialogOpen(true);
      }}
      >
        <Avatar className="size-8">
          <AvatarFallback>
            <Plus />
          </AvatarFallback>
        </Avatar>
        <span className="truncate font-normal text-[15px]">Add Account</span>
      </DropdownMenuItem>

      {accounts.map(({ name, account_id }) => (
        <DropdownMenuCheckboxItem
          key={account_id}
          checked={selectedIds.includes(account_id)}
          onCheckedChange={() => toggleAccount(account_id)}
          onSelect={(e) => e.preventDefault()}
        >
          <Avatar className="size-8">
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <span className="truncate font-normal text-[15px]">{name}</span>
        </DropdownMenuCheckboxItem>
      ))}

      <AddAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        accounts={accounts}
      />
    </>
  );
};

/** Returns up to 2 capitalised initials from name. */
const getInitials = (name: string): string => {
  const words = name.match(/\S+/g) || [];
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
};
