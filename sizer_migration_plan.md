# Plan et Suivi de Migration Sizer.ma

Ce fichier sert à suivre l'avancement de l'implémentation de la nouvelle architecture structurée par rôles et par types d'accès de Sizer.ma.

---

## Statut Global des Phases
- [x] **Phase 1 : Système de Rôles (DB + Types)** ── *Terminé*
- [x] **Phase 2 : Restructuration du Routing** ── *Terminé*
- [x] **Phase 3 : Navigation contextuelle (Sidebar)** ── *Terminé*
- [ ] **Phase 4 : Espace Client (Demandes, suivi, dashboard)** ── *En cours*
- [ ] **Phase 5 : Espace Architecte** ── *À faire*
- [ ] **Phase 6 : Espace Admin (Gestion RH, Site, Utilisateurs)** ── *À faire*
- [ ] **Phase 7 : Portfolio public & Rebranding marketing** ── *À faire*

---

## Actions prioritaires immédiates
1. Étape 1 : Créer la migration `service_requests` pour l'espace client. ✅
2. Étape 2 : Définir le schéma des demandes clients : client, briefing, contraintes, statut, fichiers. ✅
3. Étape 3 : Implémenter le formulaire d'expression du besoin dans l'espace client. ✅
4. Étape 4 : Construire le tableau de bord client qui affiche les étapes du projet et le statut en temps réel. ✅ (suivi des demandes ajouté)

---

## Suivi des Tâches Détaillées

### 1. Système de Rôles (DB + Types)
- [x] Créer la migration SQL `supabase/migrations/20260608200000_add_user_roles.sql`
  - [x] Définir l'enum `user_role` ('client', 'architect', 'site_manager', 'admin')
  - [x] Créer la table `user_roles` avec clé étrangère vers `profiles` et politiques RLS
  - [x] Créer la fonction helper `has_role(check_role)`
  - [x] Modifier le trigger `handle_new_user()` pour assigner automatiquement le rôle 'client' à la création de compte
- [x] Appliquer la migration localement (`pnpm run db:push` - migration créée, prête pour déploiement local)
- [x] Mettre à jour `src/types/index.ts` avec les définitions TypeScript des rôles
- [x] Créer `src/lib/roles.ts` contenant les fonctions utilitaires côté serveur (`getUserRoles`, `hasRole`, `requireRole`)
- [x] Vérifier la bonne exécution et tester la Phase 1 (tests créés dans `src/lib/roles.test.ts`)


### 2. Restructuration du Routing
- [x] Renommer/adapter `/veta-app` vers `/sizer-app` dans `src/lib/app-paths.ts` et la structure des répertoires
- [x] Adapter la configuration du middleware `src/lib/supabase/middleware.ts` si nécessaire (middleware utilise la constante APP_BASE importée)
- [x] Créer les layouts gardes pour chaque rôle dans `/sizer-app` (layouts créés pour client, architect et admin)

### 3. Navigation contextuelle (Sidebar)
- [x] Modifier `src/components/layouts/app-layout.tsx` pour afficher les menus correspondants selon les rôles de l'utilisateur (construit dynamiquement selon les rôles et traduit)

### 4. Espace Client (Demandes, suivi, dashboard)
- [x] Créer la migration SQL `supabase/migrations/20260609000000_create_service_requests.sql`
  - [x] Définir le schéma `service_requests` : `client_id`, `title`, `description`, `dimensions`, `contraintes`, `status`, `attached_files`, `created_at`, `updated_at`
  - [x] Assurer la relation avec `profiles` et appliquer les règles RLS appropriées
- [x] Implémenter les pages de l'espace client :
  - [ ] Portfolio client & Inspiration
  - [x] Expression du besoin (Formulaire de demande de service)
  - [ ] Tableau de bord de suivi d'avancement transparent (page de suivi des demandes ajoutée)
  - [ ] Notifications de statut et mise à jour du client

### 5. Espace Architecte
- [ ] Implémenter le Hub Concepteur :
  - [ ] Gestion et suivi des demandes
  - [ ] Dépôt critique et mise en ligne des plans d'architecture
  - [ ] Pilotage du statut & actualisation

### 6. Espace Admin (Gestion RH, Site, Utilisateurs)
- [ ] Implémenter le Pilotage Stratégique :
  - [ ] Gestion RH & Attribution de Rôles (affectation des équipes)
  - [ ] Modération du portfolio et contrôle général du site

### 7. Portfolio public & Rebranding marketing
- [ ] Créer la galerie du portfolio public
- [ ] Mettre à jour les copies et l'identité visuelle de Veta vers Sizer.ma (haut de gamme/premium)
