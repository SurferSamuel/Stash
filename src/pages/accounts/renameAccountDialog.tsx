import { Form, Formik } from "formik";
import * as yup from "yup";

// Material UI
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";

// Types
import { Account } from "../../../electron/types";
import { Dispatch, SetStateAction } from "react";

interface Props {
  accountsList: Account[];
  accountToRename: Account;
  open: boolean;
  handleClose: () => void;
  handleSuccess: () => void;
  setAccountsList: Dispatch<SetStateAction<Account[]>>;
}

interface RenameAccountFormValues {
  name: string;
}

const RenameAccountDialog = (props: Props) => {
  const {
    accountsList,
    accountToRename,
    open,
    handleClose,
    handleSuccess,
    setAccountsList,
  } = props;

  // Formik initial values (use name from props)
  const initialValues: RenameAccountFormValues = {
    name: accountToRename.name,
  }

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .test("not-existing", "Name already exists", (value) => !accountsList.some(account => account.name === value))
      .required("Name can't be empty"),
  });
  
  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle variant="h3" fontWeight={600}>
        Rename Account
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values: RenameAccountFormValues) => {
          setAccountsList(await window.electronAPI.renameAccount(values.name, accountToRename.accountId));
          handleSuccess();
        }}
      >
        {({ values, handleChange, touched, errors }) => (
          <Form>
            <DialogContent sx={{ pt: "0px", pb: "10px" }}>
              <DialogContentText>
                Edit the name of your account. Can't be the name of an existing account.
              </DialogContentText>
              {/* New account name field */}
              <Typography variant="h5" fontWeight={500} mt="14px">
                Name
              </Typography>
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
              <Button type="submit" variant="contained">Save</Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}

export default RenameAccountDialog;