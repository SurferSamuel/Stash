import { Account, getAccounts } from "@/generated";
import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface SelectedAccountsContextType {
  accounts: Account[];
  selectedIds: string[];
  selectedAccounts: Account[];
  toggleAccount: (account_id: string) => void;
  isLoading: boolean;
  isError: boolean;
}

const SelectedAccountsContext = createContext<SelectedAccountsContextType | null>(null);

export const SelectedAccountsProvider = ({ children }: { children: ReactNode }) => {
  const { data: accounts = [], isLoading, isError } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedAccounts = accounts.filter((a) => selectedIds.includes(a.account_id));
  const loaded = useRef(false);

  // Set all accounts as selected once loaded
  useEffect(() => {
    if (!loaded.current && accounts.length > 0) {
      setSelectedIds(accounts.map((a) => a.account_id));
      loaded.current = true;
    }
  }, [accounts]);

  const toggleAccount = (account_id: string) => {
    setSelectedIds((prev) =>
      prev.includes(account_id)
        ? prev.filter((id) => id !== account_id)
        : [...prev, account_id],
    );
  };

  return (
    <SelectedAccountsContext.Provider value={{ accounts, selectedIds, selectedAccounts, toggleAccount, isLoading, isError }}>
      {children}
    </SelectedAccountsContext.Provider>
  );
};

export const useSelectedAccounts = () => {
  const context = useContext(SelectedAccountsContext);
  if (!context) {
    throw new Error("useSelectedAccounts must be used within SelectedAccountProvider");
  }
  return context;
};
