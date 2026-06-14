"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

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
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { submitServiceRequest } from "@/app/actions/service-request-actions";
import { ProductSelector } from "./product-selector";
import { PrototypeProjectSelector } from "./prototype-project-selector";
import { CustomImageUpload } from "./custom-image-upload";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  title: z.string().min(5, "Le titre est trop court"),
  description: z.string().min(10, "La description est trop courte"),
  dimensions: z.string().optional(),
  constraints: z.string().optional(),

  // Enriched fields
  phone: z.string().optional(),
  client_budget: z.string().optional(),
  prototype_project_id: z.string().uuid().optional().or(z.literal("")),
  product_ids: z.array(z.string().uuid()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ServiceRequestForm({
  onSuccess,
  userEmail,
  userName,
}: {
  onSuccess?: () => void;
  userEmail?: string;
  userName?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(true);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userName || "",
      email: userEmail || "",
      title: "",
      description: "",
      dimensions: "",
      constraints: "",
      phone: "",
      client_budget: "",
      prototype_project_id: undefined,
      product_ids: [],
    },
  });


  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      // Transform data to match server action expectations
      const transformedData = {
        ...data,
        // Convert client_budget from string to number
        client_budget: data.client_budget ? parseFloat(data.client_budget) : null,
        // Ensure phone is string or null
        phone: data.phone || null,
        // Ensure prototype_project_id is string or null
        prototype_project_id: data.prototype_project_id || null,
        // product_ids is already an array
        product_ids: data.product_ids || [],
        // TODO: Handle custom image upload when implemented
        custom_item_image_asset_id: null,
      };

      const result = await submitServiceRequest(transformedData as any);
      if (result.success) {
        setEmailSent(result.emailSent ?? true);
        setIsExistingUser(result.isExistingUser ?? false);
        setIsSuccess(true);
        form.reset();
        setCustomImageFile(null);
        // Call onSuccess callback if provided (for modal usage)
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000); // Wait 2 seconds to show success message
        }
      } else {
        setErrorMessage(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      setErrorMessage("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}

        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-8 space-y-6 text-center border rounded-lg bg-card/50 backdrop-blur-sm border-gold/20"
      >
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-gold text-2xl">
          ✓
        </div>
        <h3 className="text-2xl font-light text-foreground">Demande Envoyée</h3>
        <p className="text-muted-foreground max-w-md">
          Merci pour votre confiance. Votre demande a bien été enregistrée et notre équipe vous contactera très prochainement.
        </p>
        {emailSent ? (
          isExistingUser ? (
            <div className="w-full p-4 rounded border border-gold/30 bg-gold/5 text-foreground text-sm text-left space-y-2">
              <p className="font-semibold">✅ Compte existant détecté</p>
              <p>
                Un e-mail de confirmation vous a été envoyé. Connectez-vous à votre espace client pour suivre votre nouvelle demande.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Vérifiez votre boîte de réception (et vos spams si nécessaire).
              </p>
            </div>
          ) : (
            <div className="w-full p-4 rounded border border-gold/30 bg-gold/5 text-foreground text-sm text-left space-y-2">
              <p className="font-semibold">🔐 Compte créé automatiquement</p>
              <p>
                Un e-mail avec un lien de configuration vous a été envoyé. Cliquez sur le lien pour définir votre mot de passe et accéder à votre espace client.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Vérifiez votre boîte de réception (et vos spams si nécessaire).
              </p>
            </div>
          )
        ) : (
          <div className="w-full p-3 rounded border border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-300 text-sm text-left">
            ⚠️ Votre demande a été enregistrée mais l'envoi de l'e-mail a échoué. Notre équipe vous contactera directement.
          </div>
        )}
        <Button
          variant="outline"
          className="mt-4 border-gold text-gold hover:bg-gold/10"
          onClick={() => setIsSuccess(false)}
        >
          Nouvelle demande
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean Dupont" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Adresse e-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jean@exemple.com"
                      className="h-9"
                      readOnly={!!userEmail}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Titre du projet</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Rénovation appartement" className="h-9" {...field} />
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
                <FormLabel className="text-sm font-medium">Description des besoins</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Détaillez vos attentes, le style recherché, l'ambiance souhaitée..."
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Dimensions (m²)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: 120" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="constraints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Contraintes</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Murs porteurs, budget..." className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Enrichissement - UI minimale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: +33 6 12 34 56 78" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client_budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Budget client (€)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="ex: 50000" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          {/* Prototype Project Selector */}
          <FormField
            control={form.control}
            name="prototype_project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Projet de Référence (Optionnel)</FormLabel>
                <FormControl>
                  <PrototypeProjectSelector
                    selectedProjectId={field.value || undefined}
                    onProjectSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Product Selector */}
          <FormField
            control={form.control}
            name="product_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Produits du Catalogue (Optionnel)</FormLabel>
                <FormControl>
                  <ProductSelector
                    selectedIds={field.value || []}
                    onSelectionChange={field.onChange}
                    maxSelection={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Custom Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Image Personnalisée (Optionnel)</Label>
            <CustomImageUpload
              onFileSelect={setCustomImageFile}
              currentFile={customImageFile}
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {errorMessage}
            </div>
          )}


          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10"
          >

            {isSubmitting ? "Envoi en cours..." : "Soumettre la demande"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}

// Made with Bob
