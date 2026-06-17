"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateClientProject } from "@/app/actions/project-actions";
import type { Project } from "@/types";

const formSchema = z.object({
  address: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientProjectEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onSuccess: (updated: Partial<Project>) => void;
}

export function ClientProjectEditDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: ClientProjectEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: project.address ?? "",
      description: project.description ?? "",
    },
  });

  // Reset form whenever the dialog opens with a (potentially different) project
  const handleOpenChange = (value: boolean) => {
    if (value) {
      form.reset({
        address: project.address ?? "",
        description: project.description ?? "",
      });
    }
    onOpenChange(value);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await updateClientProject(project.id, {
        address: values.address ?? "",
        description: values.description ?? "",
      });

      if (!result.success) {
        toast.error(result.error ?? "Erreur lors de la mise à jour");
        return;
      }

      toast.success("Projet mis à jour avec succès");
      onSuccess({
        address: values.address ?? "",
        description: values.description ?? "",
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de votre projet{" "}
            <span className="font-medium text-foreground">{project.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="client-project-edit-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse du projet</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex : 12 rue de la Paix, Paris"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre projet..."
                      rows={4}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="client-project-edit-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
