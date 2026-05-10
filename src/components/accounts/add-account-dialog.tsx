import { useQueryClient } from "@tanstack/react-query";
import { Account, addAccount } from "@/generated";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = (existingNames: string[]) => z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .refine(
      (name) => !existingNames.includes(name.trim()),
      "An account with this name already exists.",
    ),
});

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
}

export const AddAccountDialog = ({ open, onOpenChange, accounts }: AddAccountDialogProps) => {
  const schema = formSchema(accounts.map((acc) => acc.name));
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      try {
        await addAccount({ name: value.name.trim() });
        await queryClient.invalidateQueries({ queryKey: ["accounts"] });
        handleOpenChange(false);
        toast.success(`Account '${value.name.trim()}' has been created!`);
      } catch (e) {
        toast.error(e as string);
      }
    },
  });

  // Reset form when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Create a new account. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-account-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="eg. John Smith"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="add-account-form">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
