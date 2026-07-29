# PULVIS — Site public (maquette)

Maquette interactive du site public PULVIS : présentation de la marque, des parfums, du
fonctionnement des stations, localisateur, journal éditorial, FAQ et assistance.

Cette version est une **maquette front-end uniquement** : aucun backend, aucune base de
données, aucun paiement réel. Toutes les données (parfums, stations, articles) sont des
fichiers TypeScript locaux, faciles à modifier.

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

## Structure du projet

```
frontend/
├── src/
│   ├── components/   Composants réutilisables (Header, PerfumeCard, Accordion, …)
│   ├── pages/         Une page par route (Home, Perfumes, Journal, …)
│   ├── data/           Données fictives (perfumes.ts, stations.ts, articles.ts, faq.ts)
│   ├── App.tsx          Routes de l'application
│   ├── main.tsx         Point d'entrée React
│   └── index.css        Styles globaux + Tailwind
├── tailwind.config.js   Palette de couleurs, polices, animations
└── index.html
```

---

## Modifier les parfums

Toutes les fragrances sont définies dans [`src/data/perfumes.ts`](./src/data/perfumes.ts).

Chaque parfum est un objet avec ce format :

```ts
{
  slug: 'aero',              // utilisé dans l'URL /parfums/aero
  name: 'AERO',
  profile: 'Homme',          // 'Homme' | 'Femme' | 'Mixte'
  family: 'Frais',           // 'Frais' | 'Boisé' | 'Floral' | 'Ambré' (utilisé pour les filtres)
  familyLabel: 'Frais aquatique',
  tagline: 'Frais. Aquatique. Boisé.',
  description: '…',
  notesTop: ['Agrumes'],
  notesHeart: ['Accord marin'],
  notesBase: ['Bois'],
  intensity: 'Légère',       // 'Légère' | 'Modérée' | 'Intense'
  moments: ['Sortie de salle de sport', '…'],
  color: '#7FAFC4',
}
```

Pour ajouter un parfum, ajoutez un nouvel objet au tableau `perfumes`. La page liste
(`/parfums`), la fiche produit (`/parfums/:slug`) et les sections d'accueil se mettent à jour
automatiquement.

---

## Modifier les stations

Les stations fictives sont définies dans [`src/data/stations.ts`](./src/data/stations.ts).

```ts
{
  id: 'paris-republique',        // utilisé dans l'URL /station/paris-republique
  name: 'Fit Club République',
  type: 'Salle de sport',        // Salle de sport | Hôtel | Bar | Club | Centre commercial | Événement
  address: '12 rue du Grand Prieuré, 75011 Paris',
  city: 'Paris',
  distanceKm: 0.4,
  hours: '6h00 – 23h00',
  perfumeSlugs: ['vital', 'aero', 'forge'],   // slugs référencés dans perfumes.ts
  status: 'Disponible',            // 'Disponible' | 'Temporairement indisponible'
  stationNumber: 'PLV-014',
}
```

La page `/station/:stationId` (destinée aux QR codes apposés sur les machines) utilise
directement l'`id` de la station.

---

## Modifier le Journal

Les articles sont dans [`src/data/articles.ts`](./src/data/articles.ts). Chaque article a un
`slug` (URL `/journal/:slug`), une introduction, une citation mise en avant et un tableau
`content` de sections (titre + paragraphes).

---

## Modifier la FAQ

Les catégories et questions/réponses sont dans [`src/data/faq.ts`](./src/data/faq.ts).

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
    bg: '#1F1F1D',            // fond principal
    bgLight: '#282825',       // fond des cartes / sections alternées
    gold: '#D4A15A',          // or principal
    goldSecondary: '#C89347', // or secondaire (hover)
    cream: '#F4F1EA',         // blanc cassé (texte principal)
    muted: '#A9A7A1',         // gris texte secondaire
  },
},
```

Les classes Tailwind associées (`bg-pulvis-bg`, `text-pulvis-gold`, etc.) sont utilisées dans
tout le projet — modifier ces valeurs met à jour l'ensemble du site.

Les polices (Google Fonts) sont chargées dans `index.html` et déclarées dans
`tailwind.config.js` sous `fontFamily.serif` (titres, Cormorant Garamond) et
`fontFamily.sans` (texte courant, Work Sans).

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

- **Localisation** : pas de vraie carte ni de géolocalisation, distances et adresses fictives.
- **Paiement** : aucun paiement réel n'est déclenché nulle part sur le site.
- **Formulaire d'assistance** : n'envoie aucune donnée, affiche uniquement un état de
  confirmation local.
- **Comptes utilisateurs** : aucun système d'authentification.
- **Statistiques de scan QR** : la route `/station/:stationId` est prête à recevoir un futur
  suivi des scans, mais rien n'est mesuré actuellement.
- **Images** : blocs de remplacement stylisés, à remplacer par de vrais visuels.

---

## Prochaines améliorations possibles

- Intégrer de vraies photos/vidéos de stations et de produits.
- Brancher un vrai fournisseur de carte (Mapbox/Google Maps) sur `/trouver-pulvis`.
- Connecter le formulaire d'assistance à un backend (Supabase, cf. `CLAUDE.md` du dépôt).
- Ajouter un suivi analytique des scans de QR code sur `/station/:stationId`.
- Étendre les tests d'accessibilité (audit clavier et lecteur d'écran complet).
