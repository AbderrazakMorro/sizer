# TODO - Demande de Service Enrichie

- [ ] Inspecter le modèle/types pour `ServiceRequest` et champs invités/guest (phone, guest_phone, etc.)
- [ ] Mettre à jour `src/app/actions/service-request-actions.ts` : schema zod + insertion DB + insertion `service_request_products`
- [ ] Récupérer comment l’app gère `assets`/upload (pour mapper `custom_item_image` -> `custom_item_image_asset_id`)
- [ ] Mettre à jour `src/components/forms/service-request-form.tsx` : ajout champs phone, budget, prototype, multi-select products, upload image
- [ ] Mettre à jour `src/app/actions/admin-service-request-actions.ts` : joindre/retourner produits sélectionnés + champs enrichis
- [ ] Mettre à jour `src/components/admin/service-request-detail-dialog.tsx` : afficher téléphone, budget, prototype, image, produits
- [ ] Ajouter/adapter tests pour la nouvelle action de soumission
- [ ] Lancer `npm test` / build pour valider

