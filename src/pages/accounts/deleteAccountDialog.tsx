import { Form, Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";

// Material UI
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import useTheme from "@mui/material/styles/useTheme";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";

// Types
import { Account } from "../../../electron/types";
import { Dispatch, SetStateAction } from "react";

interface Props {
  accountToDelete: Account;
  open: boolean;
  handleClose: () => void;
  handleSuccess: () => void;
  setAccountsList: Dispatch<SetStateAction<Account[]>>;
}

interface DeleteAccountFormValues {
  name: string;
}

const DeleteAccountDialog = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {
    accountToDelete,
    open,
    handleClose,
    handleSuccess,
    setAccountsList,
  } = props;

  // Formik initial values
  const initialValues: DeleteAccountFormValues = {
    name: "",
  }

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .test("correct-name", `Input does not match "${accountToDelete.name}"`, (value) => value === accountToDelete.name),
  });
  
  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle variant="h3" fontWeight={600}>
        Are You Sure?
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async () => {
          setAccountsList(await window.electronAPI.deleteAccount(accountToDelete.accountId));
          handleSuccess();
        }}
      >
        {({ values, handleChange, touched, errors }) => (
          <Form>
            <DialogContent sx={{ pt: "0px", pb: "10px" }}>
              <DialogContentText>
                This action is permanent and irreversible. 
                Deleting this account will remove all data associated with the account. 
                This includes any trades entered for this account.
              </DialogContentText>
              <DialogContentText mt="10px">
                <span>To confirm, type "</span>
                <span style={{ color: colors.grey[100] }}>{accountToDelete.name}</span>
                <span>" in the box below.</span>
              </DialogContentText>
              {/* Name confirmation field */}
              <TextField
                fullWidth
                size="small"
                name={"name"}
                value={values.name}
                onChange={handleChange}
                sx={{ mt: "8px", ml: "-2px" }}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
            </DialogContent>
            <DialogActions sx={{ pt: "10px" }}>
              <Button variant="outlined" onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" color="error">Delete</Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}

export default DeleteAccountDialog;