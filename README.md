# Première Immo — vidéos motion design

Vidéos animées pour **premiere-immo.fr**, rendues image par image à partir de compositions HTML/GSAP, avec une bande-son entièrement synthétisée par code.

| Vidéo | Durée | Fichiers |
|---|---|---|
| **Realty, le logiciel immobilier tout-en-un** pour la page d'accueil de la refonte de realty.fr | 72 s | [`video/realty/realty-logiciel-immobilier.mp4`](video/realty/realty-logiciel-immobilier.mp4) · [`…-muet.mp4`](video/realty/realty-logiciel-immobilier-muet.mp4) · [`poster.jpg`](video/realty/poster.jpg) |
| **Agence de publicité immobilière** pour la page `/agence-publicite-immobiliere` | 36 s | [`video/agence/premiere-immo-agence-publicite.mp4`](video/agence/premiere-immo-agence-publicite.mp4) · [`…-muet.mp4`](video/agence/premiere-immo-agence-publicite-muet.mp4) · [`poster.jpg`](video/agence/poster.jpg) |
| **Publicité Facebook immobilier** pour la page `/publicite-facebook-immobilier` (avec voix off) | 32 s | [`video/facebook/premiere-immo-facebook.mp4`](video/facebook/premiere-immo-facebook.mp4) · [`…-sans-voix.mp4`](video/facebook/premiere-immo-facebook-sans-voix.mp4) · [`…-muet.mp4`](video/facebook/premiere-immo-facebook-muet.mp4) · [`poster.jpg`](video/facebook/poster.jpg) |
| **Google Ads immobilier** pour la page `/google-ads-immobilier` | 32 s | [`video/google-ads/premiere-immo-google-ads.mp4`](video/google-ads/premiere-immo-google-ads.mp4) · [`…-muet.mp4`](video/google-ads/premiere-immo-google-ads-muet.mp4) · [`poster.jpg`](video/google-ads/poster.jpg) |
| Démo générale | 25 s | [`video/demo/premiere-immo-demo.mp4`](video/demo/premiere-immo-demo.mp4) · [`…-muet.mp4`](video/demo/premiere-immo-demo-muet.mp4) · [`poster.jpg`](video/demo/poster.jpg) |

Une **landing page** complète accompagne les vidéos : voir « Landing page » plus bas ([`landing/`](landing/), aperçu filmé : [`video/landing/apercu-landing-page.mp4`](video/landing/apercu-landing-page.mp4)).

Format : 1920×1080, 30 i/s, H.264 + AAC, son normalisé à -14 LUFS (standard web). La version `-muet` n'a pas de piste audio : elle est plus légère pour une lecture automatique en arrière-plan. La version `-sans-voix` garde la musique et les effets, sans la voix off.

## Landing page « agence de publicité immobilière »

Une page autonome (HTML, CSS, JavaScript, sans outil de construction) dans [`landing/`](landing/), pensée pour les campagnes publicitaires. Elle reprend la **structure** et les **types d'animation** de la page « motion design » de l'agence Cut, donnée en exemple : thème sombre, orange, gros titres condensés, pastilles lumineuses. Le contenu est celui de Première Immo : textes, chiffres, tarifs, avis et questions de premiere-immo.fr. Les textes, les images et le code sont originaux : rien n'est repris de la page d'exemple.

| Section | Contenu | Animation |
|---|---|---|
| Accueil | « Agence de publicité **100 % immobilier** », preuves (+500 campagnes, +8 000 contacts, une agence par secteur), vidéo « agence » | Le décor « soie orange » s'allume, la navigation descend, le titre monte mot par mot, la pastille arrive lettre par lettre. Pastilles « aimantées » qui suivent la souris. Vidéo muette en boucle, « Activer le son » la relance avec le son |
| Bandeau | Agences indépendantes, agents de réseau, mandataires, leviers | Défilement horizontal infini |
| Nos leviers en vidéo | Les 3 vidéos (Google Ads, Facebook et Instagram, agence) | Carrousel en boucle, carte centrale et voisines, flèches, points (le point actif s'allonge), glisser au doigt, lecture au clic |
| La pige ne suffit plus | 5 cartes « bento » | Les leviers convergent vers le logo et un « contact vendeur » en sort (impulsions lumineuses en boucle), citation sur fond flouté, barres qui montent (+8 000), secteur qui s'allume dans un nid d'abeilles |
| Méthode | 5 étapes (appel découverte → optimisation) | Cartes inclinées qui se posent une à une, captures qui flottent, halo qui respire |
| Tarifs | Google 199 €/mois, Facebook et Instagram 139 €/mois, référencement 119 € | Surlignage peint de gauche à droite, cartes qui montent, traits qui se tracent, prix qui défilent, avantages un par un, braises orange en fond |
| Avis | Les 3 avis publiés sur le site | Trois colonnes qui défilent en sens inverses (une seule sur mobile) |
| Rendez-vous | Agenda Calendly `premiere-immo/appel-de-decouverte` | Chargé seulement à l'approche de la section |
| FAQ | 7 questions du site | Ouverture animée, « + » qui devient « − » |
| Appel final et pied de page | « Votre secteur est-il **encore disponible ?** » | Cartes inclinées en 3D qui défilent, grand logo sur une lueur orange |

La page est responsive (testée à 390 px de large), lisible sans JavaScript, et respecte le réglage « réduire les animations ». Les vidéos sont des versions web légères (720p, ≈ 2 Mo) dans `landing/media/`.

- **Voir la page** : `npm run landing` (ou ouvrir `landing/index.html` via un petit serveur local).
- **Captures et vidéo d'aperçu** : `npm run landing:shots` (→ `build/landing/shots/`) et `npm run landing:video` (→ `video/landing/apercu-landing-page.mp4`).
- **Mettre en ligne** : envoyer le dossier `landing/` tel quel sur un hébergement statique (Netlify, Vercel, OVH…), par exemple sur un sous-domaine dédié aux publicités. Ajoutez-y vos balises de suivi (pixel Meta, conversion Google Ads) dans le `<head>` de `index.html`.
- **Fonds « soie orange »** : calculés par `scripts/landing_silk.py` (aucune image externe).
- Les couleurs de l'agenda Calendly (fond sombre, orange) ne s'appliquent qu'avec une offre Calendly payante ; sinon l'agenda garde ses couleurs par défaut.

## Page d'accueil Realty (structure go.sellsy.com)

Une page d'accueil complète pour la refonte de realty.fr, dans [`realty-accueil/`](realty-accueil/) : HTML, CSS et JavaScript, sans outil de construction. Elle reprend la **structure de la page d'accueil de Sellsy** (go.sellsy.com), section par section, avec le contenu, la charte et le **menu validé** de Realty (balisage, styles et script repris tels quels des propositions de page d'accueil : `assets/realty.css`, `assets/menu.css`, `assets/menu.js`).

| Section Sellsy | Version Realty |
|---|---|
| Barre utilitaire, menu, héros (titre, deux boutons, garanties) | Liens « Pourquoi Realty », menu validé, « Le logiciel immobilier **tout-en-un** pour rentrer plus de mandats », Découvrir le logiciel / Réserver une démo |
| Vidéo de présentation | La vidéo motion Realty (version web légère, 6,5 Mo, lecture muette en boucle, bouton « Activer le son ») |
| Garanties, logos clients | eIDAS, registres loi Hoguet, site web inclus, application mobile ; « La presse parle de Realty » (logos qui défilent) |
| « S'adapte et grandit avec votre organisation » | Agence indépendante, agence en croissance, réseaux & multi-agences (d'après le tarif) |
| « Pourquoi ? » : 6 raisons | Tout inclus, de la pige à la facture, vendeurs en temps réel, 50 contrats, partout avec vous, CRM 24h/24 |
| Les 4 solutions + bandeau sombre | Les 6 domaines du menu (images tirées de la vidéo) + bandeau « Site web inclus » |
| « Facturez en toute conformité » | « Vos contrats signés en toute conformité » |
| « Souverain, sécurisé, intelligent » + 8 garanties | « Complet, connecté, mobile » : pige, site, IA + 8 fonctionnalités incluses |
| Accompagnement (texte + image) | Application mobile (texte + capture) |
| Intégrations | Multidiffusion sur les portails |
| Témoignages, « Recommandé sur » | Realty en chiffres (+100 modules, +50 contrats, 5 utilisateurs, 24h/24) et logos presse |
| Groupe TeamSystem | Tarif : 99 € HT/mois, tout inclus |
| Appel final, pied de page | « Rentrez plus de mandats, Realty fait le reste ! », pied de page aux couleurs Realty |

Tous les textes viennent du menu et de la page d'accueil validés ; les liens pointent vers les vraies pages de realty.fr. La page est responsive (testée à 390 px), lisible sans JavaScript et respecte le réglage « réduire les animations ».

- **Voir la page** : `npx http-server realty-accueil -p 8080 -c-1 -o /`
- **Remplacer la vidéo** : `realty-accueil/assets/media/realty-video.mp4` et son affiche `realty-video-poster.jpg`.

## Realty, le logiciel immobilier tout-en-un : le film, plan par plan

La vidéo de la page d'accueil de la refonte de realty.fr présente les **6 domaines du menu « Le logiciel »**, chacun avec ses fonctionnalités, puis le **site web inclus**, l'**application mobile** et l'offre. La mise en scène suit les films « produit » des éditeurs de logiciels (référence : le film de présentation de Sellsy). Chaque domaine a sa couleur. Une barre de module bleu nuit apparaît au centre, puis devient l'en-tête de la fenêtre de l'application. Un curseur clique dans l'interface, et les fonctionnalités du menu se cochent une par une, en rythme. Le film n'a pas de voix off : il est porté par la musique et les bruitages.

La charte est celle de la refonte : police Manrope, violet `#3300FF`, encre `#141B33`, dégradé orange → magenta → violet du logo, coins arrondis, vrais logos Realty (`compositions/realty/assets/`). Les textes viennent du menu et de la page d'accueil validés (propositions de page d'accueil). Les interfaces sont des maquettes simplifiées dans le style de l'application Realty, pas des captures d'écran. Les photos des biens (annonces, estimation, site web, application) sont celles fournies par Realty, dans `compositions/realty/assets/photos/`.

| Temps | Plan | Message |
|---|---|---|
| 0–4 s | Fond violet, ondes concentriques, huit fenêtres d'outils (pige, agenda, portails, mandats, contrats, factures, site web, tableur). Le curseur clique de l'une à l'autre, puis tout est aspiré au centre | **Une agence, c'est dix outils à jongler.** Pige, mandats, portails, contrats, factures… |
| 4–8 s | L'icône Realty apparaît (drop), puis le logo se déploie. La pastille violette se remplit | **Le logiciel immobilier tout-en-un.** Logiciel, site web, application mobile, pige et contrats : une seule offre |
| 8–12 s | L'application en perspective. La sélection descend la barre latérale : les 6 domaines, le site web, l'application mobile | 6 domaines · 29 fonctionnalités · tout est inclus |
| 12–18 s | **Prospection** (lavande) : les annonces de particuliers arrivent en direct, le secteur se trace sur la carte, notification, « Appeler » le vendeur | Pige immobilière (gratuit) · Porte-à-porte & phoning · Secteurs & îlots · Campagnes e-mail & SMS · Parrainage |
| 18–24 s | **Estimation & mandat** (menthe) : la valeur du bien monte jusqu'à 412 000 €, 3 ventes comparables, « Générer le mandat », signature et tampon « Signé » | Estimation comparative · Fiche bien & immeuble · Mandats & délégation · Registres des mandats · Barème d'honoraires |
| 24–30 s | **Diffusion** (pêche) : l'IA rédige l'annonce, clic sur « Diffuser », le bien part vers les portails, le site, les réseaux et les flyers | Multidiffusion · Site web agence (inclus) · Annonces par l'IA · Modèles & flyers |
| 30–36 s | **Vente** (jaune) : acquéreuse à 96 % de correspondance, créneau Click & Visit réservé, compromis signé par les deux parties, badge eIDAS | Fiches acquéreurs · Click & Visit · Offres & compromis · Signature électronique · Notification SRU |
| 36–42 s | **Location** (bleu ciel) : le bail se génère (« prêt en 2 minutes »), locataire, bailleur et garant signent, l'extranet suit loyer, quittance et honoraires | Baux de location · Acte de caution · Honoraires & règlements · Extranet locataires & bailleurs |
| 42–48 s | **Pilotage** (rose) : compteurs (mandats, CA, ventes), histogramme du chiffre d'affaires, agenda partagé, facture envoyée | Tableau de bord · Agenda partagé · Tâches & automatisations · Facturation · Tableau des clés · Multi-agences |
| 48–56 s | **Site web inclus** : le site de l'agence et sa version mobile, annonces synchronisées en temps réel. Le curseur change la couleur du site (orange, vert, violet), puis arrive une demande d'estimation | Modèles de site · Annonces en ligne · Contacts & estimations · Visibilité SEO & SEA · Statistiques · Domaine & hébergement offerts |
| 56–62 s | **Application mobile** : trois écrans du téléphone (prospection sur la carte, estimation, compromis signé au doigt) | **Prospectez, estimez et faites signer depuis le terrain.** Application mobile · Tablette et iPad · PC et Mac · Version full web |
| 62–66 s | Cartes empilées, les arguments défilent sur chaque temps, puis le prix (impact) | +100 modules intelligents · +50 types de contrats · Pige gratuite · Site web inclus · Signature électronique → **Tout est inclus : 99 € HT/mois**, 5 utilisateurs · sans option cachée |
| 66–72 s | Fond encre, logo blanc, clic sur le bouton qui pulse | **Rentrez plus de mandats, Realty fait le reste !** Réserver une démo · realty.fr |

**Son** (`scripts/score_realty.py`) : pop « produit » lumineuse, 120 BPM, ré majeur. L'ouverture a un tic-tac et un piano retenu, avec un souffle inversé quand les fenêtres sont aspirées. Le drop tombe sur le logo à 4 s. Le groove complet sous les 6 domaines enchaîne ré, la/do#, si m7 et sol maj7, une mesure par accord. Le film repart sur le site web à 48 s, monte sur les arguments, frappe un impact sur « 99 € » et finit sur un accord de ré majeur 9. Les bruitages suivent les repères de la timeline : transitions, clics du curseur, notifications, compteurs, signatures, tampon, frappe de l'IA. Chaque fonctionnalité cochée joue une note de la gamme pentatonique, de plus en plus haute.

- **Construire** : `npm run build:realty` (ou `./scripts/build.sh realty`).
- **Aperçu dans le navigateur** : `npx http-server . -p 8080 -c-1 -o /compositions/realty/` (espace : pause, ← → : ±1 s, `?t=30` pour une image fixe).
- **Changer un texte ou une fonctionnalité** : les domaines sont décrits dans le tableau `DOMAINS` de `compositions/realty/main.js` (nom, couleur, phrase, fonctionnalités et badges « Gratuit », « Inclus », « IA »).
- L'affiche (`poster.jpg`) est l'image du domaine « Prospection » à 16,6 s.

## Agence de publicité immobilière : le film, plan par plan

La vidéo de la page « agence » présente toute l'offre en 36 s : pourquoi la prospection classique ne suffit plus, les trois leviers, les résultats, la méthode, puis l'appel à l'action. Elle reprend la mise en page de la page du site (projet Framer, `PIAgency.tsx`) : sur-titres orange précédés d'un trait, cartes « bento » sur fond pêche, onglets des leviers, ligne de méthode en 5 étapes, chiffres, bandeau orange final. Les textes et les chiffres sont ceux de la page.

Le son est celui des vidéos Google Ads et Facebook : **pas de voix off**, seulement la musique « tech-house sombre » de la vidéo Facebook (ici sol mineur → si bémol majeur, avec le boum de sub quand l'écran passe à l'orange) et les bruitages. Tout est calé sur le tempo (120 BPM) : les croix, les étapes de la méthode et les notifications tombent sur les temps, et chaque levier change avec l'accord.

| Temps | Plan | Message |
|---|---|---|
| 0–6 s | Bento « Pourquoi maintenant » : trois cartes barrées d'une croix, une tous les deux temps. La carte orange « La solution » arrive, puis remplit l'écran | **Pige, portails, flyers : ça ne suffit plus.** Depuis le 11 août 2026, la pige à froid n'est plus possible · Des contacts partagés · Impossible de mesurer |
| 6–10 s | Bandeau orange, logo, les quatre leviers en pastilles | **Les vendeurs de votre secteur vous contactent.** Agence de publicité 100 % immobilier |
| 10–14 s | Onglet « Google Ads » : la recherche « estimation maison » + « votre ville », « Votre agence » passe devant le concurrent et le portail, badge « Position n°1 » | **Le levier le plus direct pour rentrer des mandats** |
| 14–18 s | Onglet « Facebook et Instagram » : votre publicité dans le fil d'un propriétaire, puis une demande d'estimation | **Faites-vous connaître avant que le propriétaire cherche** |
| 18–22 s | Onglet « Référencement naturel » : la courbe des visites venues de Google monte | **Une visibilité durable, sans budget publicitaire** |
| 22–26 s | Compteur et contacts entrants (Google Ads, Facebook, votre site) | **+8 000 contacts qualifiés générés** · +500 campagnes créées · +300 professionnels accompagnés · +4 années d'expérience en publicité |
| 26–30 s | Les 5 étapes de la méthode s'allument, une par temps. La dernière étape remplit l'écran d'orange | **On s'occupe de tout.** Une seule agence par secteur · Comptes à votre nom · Sans engagement |
| 30–36 s | Logo, titre, bouton qui pulse | **Votre secteur est-il encore disponible ?** Appel de découverte gratuit · Sans engagement · 15 minutes · Réponse immédiate sur votre zone |

Pour la page, l'affiche (`poster.jpg`) est l'image du bandeau orange « Les vendeurs de votre secteur vous contactent », à 9 s.

## Publicité Facebook immobilier : le film, plan par plan

Une vidéo pensée pour des agents qui ne connaissent pas le marketing digital : un seul message par plan, et le parcours du propriétaire en 5 étapes, comme sur la page. À gauche, les 5 étapes se cochent une à une. À droite, un téléphone montre chaque étape.

La charte est celle de la page Facebook du site (projet Framer, `PIFacebook.tsx`) : encre `#141414`, orange `#FF5100`, pêche `#FFF1EA`, crème `#F4F4F4`, bleu Facebook `#1877F2`, Plus Jakarta Sans 800, sur-titres en pastille, panneau dégradé pêche et maquette de téléphone du haut de page.

Le fil Facebook du téléphone utilise de **vraies photos** pour être crédible : la maison de la publicité, la plage et le chien des publications d'« amis », et deux photos de profil sans visage. Elles sont dans `compositions/facebook/assets/` (sources et licences dans « Crédits et droits »).

La musique suit le style des motions « produit » donnés en référence : intro atmosphérique, boum de sub au départ des étapes (4 s), kick 808 profond sur chaque temps, peu de médiums, roulements avant les transitions, puis une fin lumineuse (fa# mineur → la majeur).

**Voix off** : une voix féminine française, dynamique, presque continue, comme dans la référence. C'est une voix de synthèse (voir « Crédits et droits »). La musique s'efface sous la voix, et le fond laisse de la place aux fréquences de la parole. Le texte, calé sur l'image :

| Temps | Voix off |
|---|---|
| 0,4 s | « Vos futurs vendeurs sont sur Facebook. Chaque jour. » |
| 4,3 s | « Un propriétaire de votre secteur voit votre publicité. » |
| 7,6 s | « En deux clics, il demande une estimation. » |
| 10,7 s | « Vous recevez son contact : tout de suite, et rien qu'à vous. » |
| 13,8 s | « Vous le rappelez, et vous fixez le rendez-vous. » |
| 17,9 s | « Et vous signez le mandat. » (« mandat » tombe sur le coup de tampon) |
| 20,3 s | « Et nous, chez Première Immo, on s'occupe de tout. » |
| 24,1 s | « Comme Lucas, à Lyon : deux mandats signés en deux mois. » |
| 28,3 s | « Votre secteur est-il encore disponible ? » |
| 30,4 s | « Réservez votre appel gratuit. » |

Les prises retenues sont dans `compositions/facebook/voix/` : un fichier par phrase, et `voix.json` pour le texte et l'instant de départ. Pour changer une phrase, modifiez `voix.json`, régénérez-la avec `scripts/voix.py facebook l3` (installation décrite en tête du script), puis relancez `SKIP_RENDER=1 ./scripts/build.sh facebook` : l'image est réutilisée et seul le son est refait. Vous pouvez aussi remplacer les fichiers par l'enregistrement d'une comédienne, aux mêmes noms.

| Temps | Plan | Message |
|---|---|---|
| 0–4 s | Des propriétaires apparaissent autour du titre, avec leurs « J'aime ». Ils rejoignent ensuite le fil du téléphone | **Vos futurs vendeurs sont sur Facebook.** +40 M d'utilisateurs de Facebook en France |
| 4–7 s | Étape 1. Le propriétaire fait défiler son fil et tombe sur la publicité de votre agence, entourée d'orange. Une carte montre la zone ciblée | **Il voit votre publicité.** Dans son fil Facebook, dans votre secteur |
| 7–10,5 s | Étape 2. 1er clic sur « En savoir plus » : le formulaire s'ouvre. Adresse saisie, téléphone pré-rempli. 2e clic : « Demande envoyée », « Merci ! » | **Il demande une estimation.** En 2 clics, sans quitter Facebook |
| 10,5–13,5 s | Étape 3. Le téléphone se retourne : c'est le vôtre (« Vous, l'agence »). Il vibre : « Nouveau contact vendeur » | **Vous recevez le contact.** Tout de suite, et rien qu'à vous : contact exclusif |
| 13,5–17 s | Étape 4. La notification s'ouvre sur la fiche du contact, vous touchez « Rappeler », l'appel démarre | **Vous le rappelez.** RDV fixé : estimation jeudi 10 h |
| 17–20 s | Étape 5. Le mandat (origine : publicité Facebook) est signé à la main et tamponné « SIGNÉ ». Les 5 étapes sont cochées | **Vous signez le mandat.** Sans pige, sans portail |
| 20–23,6 s | Le tampon remplit l'écran d'orange : les visuels, les annonces, le ciblage, le suivi | **Et on s'occupe de tout.** En ligne en 72 h · Compte à votre nom · Sans engagement |
| 23,6–28 s | Avis client publié sur le site (extrait), 5 étoiles | « Je n'y connaissais strictement rien en publicité en ligne. Ils ont tout configuré. » **6 estimations et 2 mandats signés en deux mois.** Lucas R., ERA Lyon 6e |
| 28–32 s | Logo, ondes « secteur », bouton | **Votre secteur est-il encore disponible ?** Une seule agence par secteur · Appel de découverte gratuit · Sans engagement · 15 minutes |

## Google Ads immobilier : le film, plan par plan

La charte est celle du site, lue dans le projet Framer :
- **couleurs** : `#FF5100` orange, `#171717` encre, `#5E5E5E` gris, `#FCFCFC` fond, `#FFF1EA` orange doux, `#111111` et `#1B1B1B` pour les sections sombres ;
- **typographie** : Plus Jakarta Sans 800 avec un interlettrage serré ;
- **composants** : sur-titres orange avec point, boutons pilules avec flèche, cartes blanches arrondies, maquette Google « Position n°1 », notifications « Nouveau contact vendeur » ;
- **courbe d'animation** : `cubic-bezier(.2,.7,.2,1)` ;
- **logo** : le vrai logo du site.

| Temps | Plan | Message |
|---|---|---|
| 0–3,6 s | Recherche Google : « estimation maison » + « votre ville » | **Un propriétaire veut vendre ? Son premier réflexe : Google.** |
| 3,6–6 s | Sur « estimation maison », « Votre agence » remonte devant le concurrent et le portail. Bordure orange, badge « Position n°1 » | **Votre agence passe en tête.** La pastille « estimation maison + votre ville » se coche « N°1 » |
| 6–9,6 s | La recherche s'efface, on tape « agence immobilière ». Les résultats se rechargent avec un concurrent devant, puis « Votre agence » remonte en n°1. Clic sur l'annonce | La pastille « agence immobilière + votre ville » se coche « N°1 » |
| 9,6–13,6 s | L'annonce devient une notification, puis 3 contacts arrivent (demande d'estimation, appel entrant, formulaire) | **Les vendeurs vous contactent.** Contacts exclusifs, sans pige ni démarchage |
| 13,6–18 s | Le contact devient un RDV (« RDV fixé · Estimation jeudi 10 h »), puis un mandat signé à la main, tamponné « SIGNÉ » | **Vous estimez. Vous signez.** |
| 18–21 s | Le tampon remplit l'écran d'orange, les barres montent, la courbe grimpe | **Plus de mandats, plus de chiffre d'affaires.** |
| 21–25,6 s | Section sombre, comme « Nos leviers » sur le site : vos 4 leviers et 3 garanties | **On s'occupe de tout.** Campagne « vendeurs » · Campagne « agence + ville » · Acheteurs et locataires exclus · Appels et formulaires suivis · En ligne en 72 h · Compte à votre nom · Sans engagement |
| 25,6–28 s | Compteurs | **+500 campagnes · +8 000 contacts qualifiés · +300 professionnels accompagnés** |
| 28–32 s | Logo, ondes « secteur », bouton | **Votre secteur est-il encore disponible ?** Une seule agence par secteur · Appel de découverte gratuit · Sans engagement · 15 minutes |

Les textes reprennent ceux de la page Google Ads du site.

## Intégrer une vidéo sur le site

```html
<video src="/videos/premiere-immo-google-ads.mp4" poster="/videos/poster.jpg"
       autoplay muted loop playsinline controls style="width:100%;height:auto;border-radius:24px"></video>
```

- La lecture automatique n'est autorisée que **sans le son** (`muted`). Gardez `controls` pour que le visiteur puisse activer la musique.
- Dans Framer, envoyez le MP4 dans un composant **Video**, puis réglez Autoplay, Muted, Loop et le poster.
- Pour un fond décoratif, utilisez la version `-muet.mp4` sans `controls`.

## Structure du projet

```
realty-accueil/            page d'accueil Realty (structure go.sellsy.com) : index.html · assets/
landing/                   landing page autonome : index.html · css/ · js/ · img/ · media/ (vidéos web) · fonts/ · vendor/ (GSAP)
compositions/
  _shared/engine.js        moteur commun : timeline GSAP en pause, révélations de texte, mesures, caméra, aperçu
  _shared/assets/          logo du site
  agence/                  index.html · styles.css · main.js
  realty/                  index.html · styles.css · main.js · assets/ (logos Realty)
  facebook/                index.html · styles.css · main.js · assets/ (photos du fil Facebook) · voix/ (voix off)
  google-ads/              index.html · styles.css · main.js
  demo/                    la démo générale
scripts/
  render.mjs               rendu image par image (Playwright → ffmpeg), flou de mouvement adaptatif
  synth.py                 synthétiseur partagé : instruments, effets d'interface, mixage de la voix off, mastering
  score_agence.py          bande-son de la vidéo « agence de publicité immobilière »
  score_realty.py          bande-son de la vidéo Realty (page d'accueil realty.fr)
  score_facebook.py        bande-son de la vidéo Facebook
  voix.py                  synthèse de la voix off (Kyutai TTS), si l'on veut changer le texte
  score_google_ads.py      bande-son de la vidéo Google Ads
  score_demo.py            bande-son de la démo
  build.sh                 chaîne complète : ./scripts/build.sh <composition>
  landing_silk.py          fonds « soie orange » de la landing page
  landing_preview.mjs      captures et vidéo d'aperçu de la landing page
video/<composition>/       fichiers finaux
```

Fonctionnement :
1. Chaque composition est une timeline GSAP en pause. `window.__seek(t)` affiche l'image exacte à l'instant t.
2. `render.mjs` pilote la page dans Chromium. Il mesure d'abord la quantité de mouvement de chaque image, puis fait la moyenne de 6 à 48 sous-images selon la vitesse : c'est un vrai flou de mouvement, comme un obturateur à 180°. La conversion vers H.264 utilise la matrice de couleurs BT.709.
3. La timeline exporte ses repères sonores dans `build/<comp>/cues.json`. La partition s'en sert pour poser chaque bruitage au bon moment, sur une musique calée à 120 BPM.

## Refaire le rendu

Prérequis : Node 18+, Python 3.9+, ffmpeg (sinon `pip install imageio-ffmpeg`).

```bash
npm install
pip install numpy scipy pillow imageio-ffmpeg
npx playwright install chromium            # si Chromium n'est pas déjà présent

npx http-server . -p 8080 -c-1             # puis ouvrir /compositions/facebook/ : aperçu temps réel
node scripts/render.mjs stills 4.5 12.8 --comp facebook      # images fixes → build/facebook/stills/
./scripts/build.sh facebook                # rendu final → video/facebook/ (≈ 15 à 20 min)
./scripts/build.sh google-ads              # idem pour la vidéo Google Ads
./scripts/build.sh agence                  # idem pour la vidéo « agence de publicité immobilière »
./scripts/build.sh facebook --sub 1        # rendu rapide sans flou de mouvement
```

Dans l'aperçu : `espace` met en pause, `←` et `→` reculent ou avancent d'une seconde, et `?t=12.5` dans l'URL fige l'image à 12,5 s.

## Personnaliser

- **Textes** : directement dans `compositions/<comp>/index.html`.
- **Couleurs et police** : variables `:root` en haut de `styles.css`, alignées sur le projet Framer.
- **Rythme** : chaque scène est un bloc commenté de `main.js`, avec des temps en secondes sur une grille à 120 BPM (1 temps = 0,5 s).

## Crédits et droits

- Animation : [GSAP](https://gsap.com), gratuit y compris en usage commercial ([licence « no charge »](https://gsap.com/standard-license)).
- Polices : Plus Jakarta Sans, Inter, Inter Tight, Instrument Serif et Anton (SIL Open Font License), via Fontsource.
- Icônes : tracés dessinés pour le projet. La démo reprend des tracés de [Feather Icons](https://feathericons.com) (MIT).
- Voix off de la vidéo Facebook : **voix de synthèse** générée avec [Kyutai TTS 1.6B](https://huggingface.co/kyutai/tts-1.6b-en_fr) (modèle de Kyutai, laboratoire français, poids sous licence CC-BY 4.0), voix « developpeuse-3 » du dépôt [kyutai/tts-voices](https://huggingface.co/kyutai/tts-voices), enregistrée par Kyutai et publiée sous licence CC0. Usage commercial autorisé. Bonne pratique : indiquer « voix générée par IA » dans la description de la vidéo.
- Photos des vidéos Facebook et « agence » (la vidéo « agence » reprend la photo de la maison dans sa maquette Facebook) : [Unsplash](https://unsplash.com/license), licence Unsplash (usage commercial gratuit, sans autorisation ni mention obligatoire). Fichiers d'origine : maison `images.unsplash.com/photo-1523217582562-09d0def993a6`, plage `photo-1507525428034-b723cf961d3e`, chien `photo-1543466835-00a7907e9de1`, fleurs `photo-1490750967868-88aa4486c946`, montagne `photo-1464822759023-fed622ff2c3b`. Aucune photo ne montre de visage.
- Logo, textes et chiffres de Première Immo : issus du site (projet Framer).
- Musique et effets sonores : **entièrement synthétisés par code**, sans aucun échantillon externe, donc libres de droits.

## À savoir

- Dans la vidéo Facebook, l'interface de Facebook, le formulaire, la notification, l'appel, le rendez-vous et le mandat sont des **illustrations**, comme la maquette de téléphone du site. Les photos du fil sont des photos libres de droits, et les noms, l'adresse et le numéro sont fictifs. Le chiffre « +40 M d'utilisateurs » et l'avis de Lucas R. viennent de la page Facebook du site. L'avis est cité en extrait.
- Dans la vidéo Google Ads, certains éléments sont des **illustrations** : la recherche, les résultats concurrents, les notifications, les dates du calendrier, le mandat et le graphique. Le graphique ne porte volontairement aucun montant. Les chiffres +500, +8 000 et +300 viennent de la page du site.
- Dans la vidéo « agence », la recherche Google, les résultats concurrents, la publicité Facebook, les notifications et la courbe de visites sont des **illustrations**. La courbe ne porte volontairement aucun chiffre. Les chiffres (+8 000, +500, +300, +4), la date du 11 août 2026, le délai de 72 h et l'exclusivité par secteur viennent de la page du site.
- Pour la démo générale, le site n'était pas accessible à l'époque. Ses couleurs et son logo sont donc provisoires, contrairement à la vidéo Google Ads.
