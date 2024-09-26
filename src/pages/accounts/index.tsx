import { tokens } from "../../theme";
import { useEffect, useState } from "react";

// Material UI
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import useTheme from "@mui/material/styles/useTheme";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import Box from "@mui/material/Box";

// Components
import DeleteAccountDialog from "./deleteAccountDialog";
import AddAccountDialog from "./addAccountDialog";
import Header from "../../components/header";

// Types
import { Account } from "../../../electron/types";
import RenameAccountDialog from "./renameAccountDialog";

const Accounts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Load accounts list, on page render
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const accounts = await window.electronAPI.getData("accounts");
      if (isMounted) setAccountsList(accounts);
    })();
    // Clean up
    return () => { isMounted = false };
  }, []);

  // Add account dialog states
  const [openAddAccountDialog, setOpenAddAccountDialog] = useState<boolean>(false);
  const [newAccountId, setNewAccountId] = useState<string>("");

  // Rename account dialog states
  const [openRenameAccountDialog, setOpenRenameAccountDialog] = useState<boolean>(false);
  const [accountToRename, setAccountToRename] = useState<Account>({ 
    name: "", 
    accountId: "", 
    created: ""
  });

  // Delete account dialog states
  const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState<boolean>(false);
  const [accountToDelete, setAccountToDelete] = useState<Account>({ 
    name: "", 
    accountId: "", 
    created: ""
  });

  // Snackbar states & functions
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  return (
    <Box m="25px 30px 15px 30px">
      {/* Dialogs */}
      <AddAccountDialog
        accountsList={accountsList}
        setAccountsList={setAccountsList}
        newAccountId={newAccountId}
        open={openAddAccountDialog}
        handleClose={() => setOpenAddAccountDialog(false)}
        handleSuccess={() => {
          setOpenAddAccountDialog(false);
          setAlertMessage("Account successfully added");
          setOpenSnackbar(true);
        }}
      />
      <RenameAccountDialog
        accountsList={accountsList}
        accountToRename={accountToRename}
        setAccountsList={setAccountsList}
        open={openRenameAccountDialog}
        handleClose={() => setOpenRenameAccountDialog(false)}
        handleSuccess={() => {
          setOpenRenameAccountDialog(false);
          setAlertMessage("Account successfull edited");
          setOpenSnackbar(true);
        }}
      />
      <DeleteAccountDialog
        accountToDelete={accountToDelete}
        setAccountsList={setAccountsList}
        open={openDeleteAccountDialog}
        handleClose={() => setOpenDeleteAccountDialog(false)}
        handleSuccess={() => {
          setOpenDeleteAccountDialog(false);
          setAlertMessage("Account successfully deleted");
          setOpenSnackbar(true);
        }}
      />
      <Header
        title="Accounts"
        subtitle="Add, edit or remove accounts"
      />
      <Box
        display="grid"
        pb="30px"
        gap="30px"
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
      >
        {accountsList.map(account => {
          return (
            <Box
              key={account.name}
              border="1px solid"
              borderColor={colors.grey[500]}
              borderRadius={2}
              gridColumn="span 4"
              p="12px"
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography variant="h4" fontWeight={500}>
                    {account.name}
                  </Typography>
                  <Typography fontWeight={400} color={colors.grey[400]}>
                    {"Account ID: " + account.accountId}
                  </Typography>
                  <Typography fontWeight={400} color={colors.grey[400]} mt="-2px">
                    {"Created: " + account.created}
                  </Typography>
                </Box>
                <ButtonGroup sx={{ m: "-3px" }}>
                  {/* Rename account button */}
                  <Button 
                    variant="text"
                    sx={{ height: "26px" }}
                    onClick={() => {
                      setAccountToRename(account);
                      setOpenRenameAccountDialog(true);
                    }}
                  >
                    <EditRoundedIcon />
                  </Button>
                  {/* Delete account button */}
                  <Button 
                    variant="text"
                    sx={{ height: "26px" }}
                    onClick={() => {
                      setAccountToDelete(account);
                      setOpenDeleteAccountDialog(true);
                    }}
                  >
                    <DeleteRoundedIcon />
                  </Button>
                </ButtonGroup>
              </Box>
            </Box>
          )
        })}
        {/* Add new account button */}
        <Box
          border="1px solid"
          borderColor={colors.grey[500]}
          borderRadius={2}
          gridColumn="span 4"
        >
          <Button 
            fullWidth 
            variant="text" 
            sx={{ height: "74px", borderRadius: "6.5px" }}
            onClick={async () => {
              setNewAccountId(await window.electronAPI.generateAccountId());
              setOpenAddAccountDialog(true);
            }}
          >
            <Typography fontSize={50} mt="-6px">+</Typography>
          </Button>
        </Box>
      </Box>
      {/* Show snackbar on action success */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
      >
        <Alert onClose={() => setOpenSnackbar(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Accounts;