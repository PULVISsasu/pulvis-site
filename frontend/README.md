# PULVIS — Site public (maquette)

Site vitrine B2B de PULVIS : présentation du concept, du fonctionnement, de la station, et
formulaire de génération de leads pour les établissements souhaitant devenir partenaires
(marché prioritaire : les salles de sport).

Cette version est une **maquette front-end uniquement** : aucun backend, aucune base de
données, aucun paiement réel. Le formulaire « Devenir partenaire » n'envoie aucune donnée et
affiche uniquement un état de confirmation local.

---

## Lancer le site en local

```bash
cd frontend
npm install
npm run dev
```

Le site est alors disponible sur **http://localhost:5173**.

Autres commandes utiles :

```bash
npm run build     # build de production dans dist/
npm run preview   # prévisualiser le build de production
npm run lint      # vérifier le code avec ESLint
```

---

## Architecture du site

| Route                            | Page                        |
|-----------------------------------|------------------------------|
| `/`                                | Accueil                      |
| `/le-concept`                      | Le concept                   |
| `/salles-de-sport`                 | Pour les salles de sport     |
| `/la-station`                      | La station                   |
| `/comment-ca-fonctionne`           | Comment ça fonctionne (parcours partenaire) |
| `/faq`                             | FAQ                          |
| `/devenir-partenaire`              | Formulaire partenaire        |
| `/mentions-legales`                | Mentions légales             |
| `/politique-de-confidentialite`    | Politique de confidentialité |
| `/cookies`                         | Gestion des cookies          |

L'objectif principal du site est d'obtenir des établissements partenaires intéressés par
l'installation d'une station PULVIS — pas de vendre une machine en ligne. Le CTA principal est
partout « Devenir établissement partenaire ».

---

## Structure du projet

```
frontend/
├── src/
│   ├── components/   Composants réutilisables (Header, PartnerForm, EligibilityCheck, …)
│   ├── pages/         Une page par route
│   ├── data/           Données modifiables (perfumes.ts, faq.ts, benefits.ts, steps.ts, establishmentTypes.ts)
│   ├── hooks/          usePageMeta.ts — titre et meta description par page (SEO)
│   ├── App.tsx          Routes de l'application
│   ├── main.tsx         Point d'entrée React
│   └── index.css        Styles globaux + Tailwind
├── tailwind.config.js   Palette de couleurs, polices, animations
└── index.html            Meta tags, Open Graph, données structurées
```

---

## Modèle économique — règles à respecter

Ces règles sont structurantes pour tout le contenu du site (voir `CLAUDE.md` à la racine du
dépôt pour le brief complet) :

- L'installation ne représente **aucun investissement financier direct** pour l'établissement.
- PULVIS prend en charge : installation, parfums, réapprovisionnement, maintenance, paiements,
  suivi, assistance.
- PULVIS conserve **100 % des revenus** générés par les stations — ne jamais présenter le
  modèle comme un partage de revenus ou une commission pour l'établissement.
- Aucune donnée financière (CA, marge, rentabilité) n'est affichée publiquement.

---

## Modifier les parfums

Toutes les fragrances sont définies dans [`src/data/perfumes.ts`](./src/data/perfumes.ts).
Elles sont affichées à titre de présentation (pas de vente en ligne) sur la page d'accueil.

---

## Modifier la FAQ

Les catégories et questions/réponses sont dans [`src/data/faq.ts`](./src/data/faq.ts).

---

## Modifier le formulaire partenaire

Le formulaire complet est dans [`src/components/PartnerForm.tsx`](./src/components/PartnerForm.tsx),
les types d'établissement proposés dans [`src/data/establishmentTypes.ts`](./src/data/establishmentTypes.ts).

Un module de pré-qualification plus léger (« Votre établissement est-il adapté à PULVIS ? »)
est disponible sur la page d'accueil : [`src/components/EligibilityCheck.tsx`](./src/components/EligibilityCheck.tsx).

---

## Remplacer les images

Cette maquette utilise des **blocs de remplacement visuels** (`PlaceholderImage`,
`src/components/PlaceholderImage.tsx`) plutôt que des photos, pour rester clairement
identifiable comme une maquette et éviter toute dépendance à des images externes.

Pour remplacer un placeholder par une vraie image :

1. Déposez votre image dans `public/images/` (ex. `public/images/hero.jpg`).
2. Remplacez le composant `<PlaceholderImage label="…" className="…" />` par une balise
   `<img src="/images/hero.jpg" alt="…" className="…" />` en conservant les classes
   d'agencement (`aspect-[…]`, `w-full`, `rounded-2xl`, etc.).

---

## Modifier les couleurs

La palette est centralisée dans [`tailwind.config.js`](./tailwind.config.js) :

```js
colors: {
  pulvis: {
    bg: '#1F1F1D',            // fond principal (anthracite)
    bgLight: '#282825',       // fond des cartes / sections alternées
    gold: '#D4A15A',          // or principal (accent, à utiliser avec parcimonie)
    goldSecondary: '#C89347', // or secondaire (hover)
    cream: '#F4F1EA',         // blanc cassé (texte principal)
    muted: '#A9A7A1',         // gris texte secondaire
  },
},
```

Les polices (Google Fonts) sont chargées dans `index.html` et déclarées dans
`tailwind.config.js` sous `fontFamily.serif` (titres, Cormorant Garamond) et
`fontFamily.sans` (texte courant, Work Sans).

---

## SEO

- Titre et meta description gérés par page via `usePageMeta` (`src/hooks/usePageMeta.ts`).
- `index.html` contient les meta Open Graph, Twitter Card et un bloc `Organization`
  JSON-LD.
- `public/robots.txt` et `public/sitemap.xml` sont prêts, à mettre à jour avec le domaine
  définitif avant mise en production.

---

## Pages légales

`Mentions légales`, `Politique de confidentialité` et `Gestion des cookies` contiennent des
sections marquées `[À COMPLÉTER]` : à renseigner avec les informations réelles de la société
avant mise en production. Aucune information légale n'a été inventée.

---

## Publier sur Vercel

1. Poussez le dépôt sur GitHub (déjà fait si vous lisez ce fichier depuis le repo).
2. Sur [vercel.com](https://vercel.com), importez le projet et sélectionnez le sous-dossier
   `frontend` comme **Root Directory**.
3. Vercel détecte automatiquement Vite : gardez `npm run build` comme build command et `dist`
   comme output directory.
4. Déployez — aucune variable d'environnement n'est nécessaire, cette maquette ne dépend
   d'aucun backend.

---

## Ce qui reste fictif dans cette maquette

- **Formulaires** (« Devenir partenaire », éligibilité) : n'envoient aucune donnée réelle,
  affichent uniquement un état de confirmation local.
- **Images** : blocs de remplacement stylisés, à remplacer par de vrais visuels de la station.
- **Caractéristiques techniques de la station** : les informations non confirmées utilisent des
  formulations explicites (« communiquées lors de l'étude de votre emplacement ») plutôt que
  des valeurs inventées.
- **Mentions légales** : placeholders `[À COMPLÉTER]` en attente des informations réelles.

---

## Prochaines améliorations possibles

- Connecter le formulaire partenaire à un backend (Supabase, cf. `CLAUDE.md` du dépôt) pour la
  génération de leads réelle.
- Intégrer de vraies photos/vidéos de la station et de son installation en salle de sport.
- Ajouter une section « Étude de cas » une fois les premières installations validées
  (uniquement des métriques d'usage autorisées : utilisations, préférences, disponibilité —
  jamais de données financières).
- Étendre les tests d'accessibilité (audit clavier et lecteur d'écran complet).
