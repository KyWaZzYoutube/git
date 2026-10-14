#!/usr/bin/env python3
"""
Génère les propositions 6 à 11 de la page d'accueil Realty et leur sommaire.

  python3 realty-propositions/build.py

Le menu validé, le pied de page et les sections réutilisées sont repris de
realty-accueil/index.html (même balisage, mêmes liens). Chaque proposition
change la composition : bento, vidéo plein écran, hub, parcours, rail, éditorial.
Les images et la vidéo sont celles de realty-accueil/assets (lien « assets »).
"""
import math
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = open(os.path.join(HERE, '..', 'realty-accueil', 'index.html'), encoding='utf-8').read()

SPRITE = SRC[SRC.find('<svg width="0"'):SRC.find('<div class="sx-util">')].strip()
HEADER = SRC[SRC.find('<header'):SRC.find('<main id="contenu">')].strip()
FOOTER = SRC[SRC.find('<footer class="sx-foot">'):SRC.find('</footer>') + 9]
MAIN = SRC[SRC.find('<main id="contenu">') + len('<main id="contenu">'):SRC.find('</main>')]
SECTIONS = {}
for part in MAIN.split('<!-- ================= ')[1:]:
    title, body = part.split(' =================', 1)
    SECTIONS[title.split(' ')[0].rstrip(':,').lower()] = body.split('-->', 1)[1].strip()
# clés : héros, pour, pourquoi, les, conformité, complet, application, multidiffusion, chiffres, tarif, appel

ico = lambda i: f'<svg class="i" aria-hidden="true"><use href="#{i}"/></svg>'

DOMAINS = [
    dict(id='prospection', name='Prospection', verb='Prospecter', icon='i-radar', color='#FF5A36', href='https://www.realty.fr/logiciel#pige-immobiliere',
         hook='Chaque annonce de particulier arrive dans Realty en temps réel, avec suivi et relances.',
         feats=['Pige immobilière (gratuite)', 'Porte-à-porte & phoning', 'Secteurs & îlots', 'Campagnes e-mail & SMS', 'Parrainage'],
         alt='Écran Prospection : annonces de particuliers en direct et secteur sur la carte'),
    dict(id='estimation', name='Estimation & mandat', verb='Estimer', icon='i-file', color='#0B9B6A', href='https://www.realty.fr/logiciel#estimation',
         hook='Des avis de valeur solides et des mandats signés en deux clics.',
         feats=['Estimation comparative', 'Fiche bien & immeuble', 'Mandats & délégation', 'Registres des mandats', 'Barème d’honoraires'],
         alt='Écran Estimation : valeur du bien, ventes comparables et mandat signé'),
    dict(id='diffusion', name='Diffusion', verb='Diffuser', icon='i-share', color='#E0219B', href='https://www.realty.fr/logiciel#multidiffusion',
         hook='Vos biens sur tous les portails et sur votre site, sans double saisie.',
         feats=['Multidiffusion', 'Site web agence (inclus)', 'Annonces par l’IA', 'Modèles & flyers'],
         alt='Écran Diffusion : annonce rédigée par l’IA et publiée sur tous les canaux'),
    dict(id='vente', name='Vente', verb='Vendre', icon='i-handshake', color='#D99A00', href='https://www.realty.fr/logiciel',
         hook='De la première visite au compromis signé électroniquement.',
         feats=['Fiches acquéreurs', 'Click & Visit', 'Offres & compromis', 'Signature électronique', 'Notification SRU'],
         alt='Écran Vente : fiche acquéreur, visite Click & Visit et compromis signé'),
    dict(id='location', name='Location', verb='Louer', icon='i-key', color='#1D7BEA', href='https://www.realty.fr/logiciel#contrats',
         hook='Tous vos baux générés et signés en quelques minutes.',
         feats=['Baux de location', 'Acte de caution', 'Honoraires & règlements', 'Extranet locataires & bailleurs'],
         alt='Écran Location : bail généré, signatures et extranet'),
    dict(id='pilotage', name='Pilotage', verb='Piloter', icon='i-chart', color='#3300FF', href='https://www.realty.fr/logiciel',
         hook='Vos chiffres, vos équipes et vos tâches réunis dans un tableau de bord.',
         feats=['Tableau de bord', 'Agenda partagé', 'Tâches & automatisations', 'Facturation', 'Tableau des clés', 'Multi-agences'],
         alt='Écran Pilotage : chiffres de l’agence, chiffre d’affaires et agenda partagé'),
]
img = lambda d: f'assets/img/domaine-{d["id"]}.jpg'
esc = lambda s: s.replace('&', '&amp;')

VIDEO = lambda extra='': f'''<video id="sxVideo" src="assets/media/realty-video.mp4" poster="assets/media/realty-video-poster.jpg" autoplay muted loop playsinline preload="metadata" aria-label="Vidéo de présentation de Realty : les 6 domaines du logiciel, le site web et l’application mobile"{extra}></video>'''
SOUND = f'<button class="sx-sound" id="sxSound" type="button" aria-pressed="false">{ico("i-volume-off")}<span>Activer le son</span></button>'
PRESS = [('jda.svg', 'Journal de l’Agence', ''), ('immomatin.svg', 'Immomatin', ''), ('flashimmo.svg', 'Flash Immo', 'tall'), ('immo2.svg', 'Immo2', '')]
CTA2 = f'''<div class="sx-ctas"><a class="sx-btn sx-btn-p" href="https://www.realty.fr/demonstration">Réserver une démo{ico("i-arrow")}</a><a class="sx-btn sx-btn-s" href="https://www.realty.fr/logiciel">Découvrir le logiciel</a></div>'''


def sec(key, cls=''):
    s = SECTIONS[key]
    return s.replace('<section class="', f'<section class="{cls} ', 1) if cls else s


# ============================================================ 06 · BENTO
def p06():
    live = [('maison-terrasse.jpg', 'Maison 5 pièces · 128 m²', 'Rezé · il y a 1 min'), ('salon.jpg', 'Appartement T3 · 68 m²', 'Nantes · il y a 4 min'), ('pavillon.jpg', 'Pavillon · 110 m²', 'Vertou · il y a 9 min')]
    hero = f'''<section class="bn-hero"><div class="sx-wrap">
  <div class="bn-top"><span class="sx-pill">Le logiciel immobilier tout-en-un</span>
    <h1 class="bn-h1">Tout votre métier immobilier, <span class="sx-hl">dans un seul logiciel.</span></h1></div>
  <div class="bn-grid">
    <div class="bn-t bn-video pp-video">{VIDEO()}{SOUND}</div>
    <div class="bn-t bn-price"><span class="bn-k">{ico("i-star")}Offre tout inclus</span><b>99&nbsp;€<small>HT/mois</small></b><p>Logiciel, site web, application, pige et contrats. 5 utilisateurs.</p><a class="sx-btn sx-btn-w" href="https://www.realty.fr/demonstration">Réserver une démo{ico("i-arrow")}</a></div>
    <div class="bn-t bn-pige"><span class="bn-k">{ico("i-radar")}Pige en direct</span><h3>Les vendeurs arrivent en temps réel</h3>
      <ul class="bn-live">{"".join(f'<li><img src="assets/img/{f}" alt="" width="40" height="40" loading="lazy"><span>{t}<small>{s}</small></span><em>Nouveau</em></li>' for f, t, s in live)}</ul></div>
    <div class="bn-t bn-site"><img src="assets/img/site-web-immobilier-gratuit.webp" alt="Choix du modèle de site web d’agence" width="1100" height="977" loading="lazy"><div><span class="bn-k">{ico("i-globe")}Site web inclus</span><h3>Votre site d’agence, à vos couleurs</h3><p>Modèle au choix, annonces publiées en temps réel, domaine et hébergement offerts.</p></div></div>
    <div class="bn-t bn-mob"><span class="bn-k">{ico("i-phone")}Application mobile</span><h3>Signez depuis le terrain</h3><img src="assets/img/logiciel-immobilier-mobile.webp" alt="Realty sur téléphone" width="1100" height="976" loading="lazy"></div>
    <div class="bn-t bn-sign"><span class="big">+&#8239;50</span><h3>contrats signés en ligne</h3><p>Mandats, offres, compromis et baux, avec la signature électronique eIDAS.</p></div>
    <div class="bn-t bn-press"><p>La presse parle de Realty</p><ul>{"".join(f'<li><img class="{c}" src="assets/img/{f}" alt="{a}" height="26" loading="lazy"></li>' for f, a, c in PRESS)}</ul></div>
  </div></div></section>'''
    tiles = []
    layout = ['wide', '', '', 'wide', '', '']
    for d, w in zip(DOMAINS, layout):
        tiles.append(f'''<a class="bn-dom {w} sx-rv" href="{d["href"]}"><div class="shot"><img src="{img(d)}" alt="{d["alt"]}" width="720" height="540" loading="lazy"></div><div class="body"><h3>{esc(d["name"])}</h3><p>{d["hook"]}</p><div class="tags">{"".join(f"<span>{esc(f)}</span>" for f in d["feats"][:4])}</div></div></a>''')
    tiles.append(f'''<a class="bn-dom plain sx-rv" href="https://www.realty.fr/logiciel"><span class="bn-k" style="color:#CFC6FF">{ico("i-grid")}Et aussi</span><div><h3>29 fonctionnalités, 6 domaines</h3><p style="margin-top:10px">Facturation, registres loi Hoguet, notification SRU, tableau des clés, automatisations…</p></div><span class="sx-tlink" style="color:#fff">Toutes les fonctionnalités{ico("i-chevr")}</span></a>''')
    doms = f'''<section class="sx-sec"><div class="sx-wrap">
  <div class="sx-head sx-rv" style="align-items:flex-start;text-align:left"><span class="sx-pill">Le logiciel</span><h2 class="sx-h2">Six domaines, <span class="sx-hl">une seule fiche client</span></h2></div>
  <div class="bn-doms">{"".join(tiles)}</div></div></section>'''
    return hero + doms + sec('tarif') + sec('appel')


# ============================================================ 07 · VIDÉO PLEIN ÉCRAN
def p07():
    hero = f'''<section class="vf-hero"><div class="pp-video">{VIDEO()}</div>
  <div class="sx-wrap vf-in">
    <div class="vf-copy"><span class="vf-tag"><i></i>Realty en 1 minute</span>
      <h1 class="vf-h1">Le logiciel immobilier qui rentre vos mandats.</h1>
      <p class="vf-lead">Prospection, estimation, diffusion, vente, location et pilotage, avec votre site web et l’application mobile. Tout est inclus.</p>
      <div class="vf-ctas"><a class="sx-btn sx-btn-w" href="https://www.realty.fr/demonstration">Réserver une démo{ico("i-arrow")}</a>{SOUND}</div></div>
    <div class="vf-glass"><span>{ico("i-euro")}<b>99&nbsp;€</b>HT/mois, tout inclus</span><span>{ico("i-users")}<b>5</b>utilisateurs</span><span>{ico("i-globe")}Site web et application inclus</span></div>
  </div></section>'''
    strip = f'''<div class="sx-wrap"><ul class="vf-strip">
  <li><b>+&#8239;100</b><span>modules intelligents</span></li><li><b>+&#8239;50</b><span>types de contrats</span></li>
  <li><b>Gratuite</b><span>pige immobilière en temps réel</span></li><li><b>24h/24</b><span>un CRM qui travaille pour vous</span></li></ul></div>'''
    rows = ''.join(f'''<a class="vf-row sx-rv" href="{d["href"]}"><span class="n">0{i + 1}</span><h3>{esc(d["name"])}</h3><p>{d["hook"]}<small>{esc(" · ".join(d["feats"]))}</small></p><img src="{img(d)}" alt="" width="150" height="100" loading="lazy"><span class="sx-arrow">{ico("i-arrow")}</span></a>''' for i, d in enumerate(DOMAINS))
    lst = f'''<section class="sx-sec"><div class="sx-wrap">
  <div class="sx-head sx-rv" style="align-items:flex-start;text-align:left"><span class="sx-pill">Le logiciel</span><h2 class="sx-h2">De la pige à la facture, <span class="sx-hl">dans le même outil</span></h2></div>
  <div class="vf-list">{rows}</div></div></section>'''
    return hero + strip + lst + sec('application', 'sx-soft') + sec('tarif') + sec('appel')


# ============================================================ 08 · HUB
def p08():
    mods = [(d['name'], d['icon'], d['color'], d['hook'], d['href']) for d in DOMAINS] + [
        ('Site web inclus', 'i-globe', '#141B33', 'Votre site d’agence à vos couleurs, avec vos annonces publiées en temps réel.', 'https://www.realty.fr/site-web-agence'),
        ('Application mobile', 'i-phone', '#7E5BFF', 'Prospectez, estimez et faites signer un compromis depuis votre téléphone.', 'https://www.realty.fr/logiciel')]
    nodes, lines = [], []
    for k, (n, ic, col, hook, href) in enumerate(mods):
        a = -math.pi / 2 + k * 2 * math.pi / len(mods)
        x, y = 50 + 41 * math.cos(a), 50 + 41 * math.sin(a)
        nodes.append(f'<a class="hb-node" href="{href}" style="left:{x:.2f}%;top:{y:.2f}%;--c:{col}" data-name="{esc(n)}" data-hook="{hook}" data-href="{href}"><span class="b" style="background:{col}">{ico(ic)}</span>{esc(n)}</a>')
        lines.append(f'<line x1="50" y1="50" x2="{x:.2f}" y2="{y:.2f}"/>')
    hero = f'''<section class="hb-hero"><div class="sx-wrap">
  <div class="hb-head"><span class="sx-pill">Un seul outil, tout connecté</span><h1 class="hb-h1">Tous les outils de votre agence, <span class="sx-hl">autour d’une seule fiche.</span></h1></div>
  <div class="hb-orbit">
    <svg class="lines" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="41"/><circle class="c2" cx="50" cy="50" r="30"/>{"".join(lines)}</svg>
    <div class="hb-center" aria-live="polite"><img src="assets/img/realty-icone.png" alt="" width="56" height="56"><b>Realty</b><p>6 domaines, le site web et l’application mobile. 99&nbsp;€&nbsp;HT/mois, tout inclus.</p></div>
    {"".join(nodes)}
  </div>
  <div class="hb-ctas"><a class="sx-btn sx-btn-p" href="https://www.realty.fr/demonstration">Réserver une démo{ico("i-arrow")}</a><a class="sx-btn sx-btn-s" href="https://www.realty.fr/simulateur-economies">Simuler mes économies</a></div>
  </div></section>'''
    tools = [('i-radar', 'Pige'), ('i-calendar', 'Agenda'), ('i-portal', 'Portails'), ('i-file', 'Contrats'), ('i-pen', 'Signature'), ('i-euro', 'Facturation'), ('i-globe', 'Site web'), ('i-chart', 'Tableur')]
    vs = f'''<section class="sx-sec"><div class="sx-wrap">
  <div class="sx-head sx-center sx-rv"><span class="sx-pill">Avant / avec Realty</span><h2 class="sx-h2">Arrêtez d’empiler <span class="sx-hl">les abonnements</span></h2></div>
  <div class="hb-vs">
    <div class="hb-card hb-before sx-rv"><h3>Sans Realty</h3><p>Un outil par tâche, des données ressaisies partout.</p>
      <ul class="hb-tools">{"".join(f'<li>{ico(i)}{t}<s>1 abonnement</s></li>' for i, t in tools)}</ul></div>
    <div class="hb-card hb-after sx-rv" data-d="1"><h3>Avec Realty</h3><p>Une seule offre, la plus complète du marché.</p>
      <div class="one"><img src="assets/img/realty-icone.png" alt="" width="52" height="52"><div><b>99&nbsp;€&nbsp;HT/mois, tout inclus</b><span>5 utilisateurs, sans option cachée</span></div></div>
      <ul>{"".join(f'<li>{ico("i-checkc")}{t}</li>' for t in ["Pige en temps réel", "Agenda partagé", "Multidiffusion", "Plus de 50 contrats", "Signature eIDAS", "Facturation", "Site web inclus", "Tableau de bord"])}</ul>
      <a class="sx-btn sx-btn-w" href="https://www.realty.fr/simulateur-economies">Simuler mes économies{ico("i-arrow")}</a></div>
  </div></div></section>'''
    return hero + vs + sec('les', 'sx-soft').replace('style="padding-top:0"', '') + sec('chiffres') + sec('appel')


# ============================================================ 09 · PARCOURS
def p09():
    steps = []
    for k, d in enumerate(DOMAINS):
        steps.append(f'''<button class="pc-step{' on' if k == 0 else ''}" type="button" role="tab" aria-selected="{'true' if k == 0 else 'false'}" data-name="{esc(d["name"])}" data-title="{esc(d["name"])}" data-hook="{d["hook"]}" data-feats="{esc("|".join(d["feats"]))}" data-img="{img(d)}" data-alt="{d["alt"]}" data-href="{d["href"]}"><span class="dot">{ico(d["icon"])}</span><b>{d["verb"]}</b><small>{esc(d["feats"][0])}</small></button>''')
    d0 = DOMAINS[0]
    hero = f'''<section class="pc-hero"><div class="sx-wrap">
  <span class="sx-pill">De la pige à la facture</span>
  <h1 class="pc-h1">Chaque étape de votre métier, <span class="sx-hl">au même endroit.</span></h1>
  <div class="pc-row"><p class="sx-lead">Suivez un bien de la première annonce de particulier jusqu’à la facture d’honoraires. Choisissez une étape pour la voir dans Realty.</p>{CTA2}</div>
  <div class="pc-track"><div class="pc-steps" role="tablist" aria-label="Étapes">{"".join(steps)}<i class="pc-fill"></i></div></div>
  <div class="pc-panel"><div class="shot"><img src="{img(d0)}" alt="{d0["alt"]}" width="720" height="540"></div>
    <div class="txt"><span class="k">Étape 1 sur 6</span><h2>{esc(d0["name"])}</h2><p>{d0["hook"]}</p><ul>{"".join(f'<li>{ico("i-checkc")}{esc(f)}</li>' for f in d0["feats"])}</ul></div></div>
  </div></section>'''
    return hero + sec('complet') + sec('multidiffusion') + sec('tarif') + sec('appel')


# ============================================================ 10 · RAIL
def p10():
    cards = [f'<div class="rl-card video"><div class="pp-video">{VIDEO()}</div>{SOUND}<span class="k">Le film</span><h3>Realty en 1 minute</h3><p>Les 6 domaines, le site web et l’application mobile.</p></div>']
    for d in DOMAINS:
        cards.append(f'<a class="rl-card" href="{d["href"]}"><img src="{img(d)}" alt="{d["alt"]}" width="720" height="540" loading="lazy"><span class="k">{d["verb"]}</span><h3>{esc(d["name"])}</h3><p>{d["hook"]}</p></a>')
    cards.append(f'<a class="rl-card" href="https://www.realty.fr/site-web-agence"><img src="assets/img/site-web-immobilier-gratuit.webp" alt="Modèles de site web d’agence" width="1100" height="977" loading="lazy" style="object-position:50% 30%"><span class="k">Inclus</span><h3>Votre site web d’agence</h3><p>Modèle au choix, à vos couleurs, domaine et hébergement offerts.</p></a>')
    cards.append(f'<a class="rl-card" href="https://www.realty.fr/logiciel"><img src="assets/img/logiciel-immobilier-mobile.webp" alt="Realty sur téléphone" width="1100" height="976" loading="lazy" style="object-position:80% 0"><span class="k">Partout avec vous</span><h3>L’application mobile</h3><p>Prospectez, estimez et faites signer depuis le terrain.</p></a>')
    cards.append(f'<a class="rl-card flat" href="https://www.realty.fr/tarif"><span class="k">Offre tout inclus</span><b>99&nbsp;€</b><h3>HT/mois, 5 utilisateurs</h3><p>Sans option cachée. 12&nbsp;€&nbsp;HT/mois par utilisateur supplémentaire.</p></a>')
    hero = f'''<section class="rl-hero"><div class="sx-wrap">
  <span class="sx-pill">Le logiciel des agences immobilières</span>
  <h1 class="rl-h1">Rentrez plus de mandats. <span class="sx-hl">Realty fait le reste.</span></h1>
  <div class="rl-row"><p>Le logiciel immobilier tout-en-un qui automatise votre prospection, vos estimations, vos contrats et vos relances.</p>{CTA2}</div></div>
  <div class="rl-railwrap"><div class="rl-rail" tabindex="0" aria-label="Ce que contient Realty">{"".join(cards)}</div>
    <div class="rl-ctrl"><div class="rl-bar"><i></i></div><button class="rl-btn prev" type="button" aria-label="Précédent">{ico("i-arrow")}</button><button class="rl-btn next" type="button" aria-label="Suivant">{ico("i-arrow")}</button></div></div>
  </section>'''
    return hero + sec('pourquoi') + sec('conformité') + sec('chiffres') + sec('appel')


# ============================================================ 11 · ÉDITORIAL
def p11():
    hero = f'''<section class="ed-hero"><div class="sx-wrap">
  <div class="ed-k"><span>Le logiciel immobilier tout-en-un</span><span>Logiciel · Site web · Application · Pige · Contrats</span></div>
  <h1 class="ed-h1"><span>Rentrez plus</span><span>de mandats.</span><span class="sx-hl">Realty fait le reste.</span></h1>
  <div class="ed-cols">
    <p>Prospection, estimation, diffusion, vente, location et pilotage réunis dans un seul outil, avec votre site web et l’application mobile. Vos tâches répétitives disparaissent&#8239;; vous gardez le temps pour vos clients.</p>
    <div class="sx-ctas"><a class="sx-btn sx-btn-p" href="https://www.realty.fr/demonstration">Réserver une démo{ico("i-arrow")}</a><a class="sx-btn sx-btn-s" href="https://www.realty.fr/simulateur-economies">Simuler mes économies</a></div>
    <div class="ed-price"><b>99&nbsp;€</b><span>HT/mois, tout inclus<br>5 utilisateurs</span></div>
  </div>
  <figure class="ed-film"><div class="pp-video sx-video" style="margin:0;border-radius:6px">{VIDEO()}{SOUND}</div>
    <figcaption class="ed-cap"><span><b>Le film</b> · 1 min 12</span><span>Les 6 domaines, le site web et l’application mobile</span></figcaption></figure>
  </div></section>'''
    chs = ''.join(f'''<article class="ed-ch sx-rv"><span class="n">0{i + 1}</span><div><h3>{esc(d["name"])}</h3><p class="hook">{d["hook"]}</p><a class="sx-tlink" style="margin-top:14px;font-size:15.5px" href="{d["href"]}">Découvrir{ico("i-chevr")}</a></div><ul>{"".join(f"<li>{esc(f)}</li>" for f in d["feats"])}</ul><img src="{img(d)}" alt="{d["alt"]}" width="720" height="540" loading="lazy"></article>''' for i, d in enumerate(DOMAINS))
    chapters = f'''<section class="sx-sec" style="padding-top:clamp(24px,4vw,48px)"><div class="sx-wrap">
  <div class="ed-title sx-rv"><h2>Votre métier, en six chapitres</h2><p>Dans l’ordre où vous le vivez&#8239;: de l’annonce de particulier jusqu’au tableau de bord.</p></div>
  {chs}
  <div class="ed-quote sx-rv" style="margin-top:clamp(36px,5vw,56px)"><p>Logiciel, site web, application, pige et contrats&#8239;: <span>une seule offre, la plus complète du marché.</span></p><a class="sx-btn sx-btn-w" href="https://www.realty.fr/tarif">Voir le tarif{ico("i-arrow")}</a></div>
  </div></section>'''
    return hero + chapters + sec('chiffres') + sec('appel')


PAGES = [
    ('06-bento.html', 'Bento', p06, 'Grille de tuiles', 'Moderne, dense', 'Tuile violette dès l’accueil', 'Vidéo, pige en direct, site, application et contrats réunis dans une grille de tuiles ; les 6 domaines en tuiles de tailles variées.'),
    ('07-video-plein-ecran.html', 'Vidéo plein écran', p07, 'Vidéo en fond, titre posé dessus', 'Immersive, cinéma', 'Pastilles sur la vidéo + section', 'Le film occupe tout le haut de page, le titre est posé dessus ; les 6 domaines en grandes lignes numérotées.'),
    ('08-hub.html', 'Hub', p08, 'Schéma circulaire interactif', 'Pédagogique', 'Centre du hub + avant / avec Realty', 'Realty au centre, les 8 modules autour : survolez-les pour les découvrir ; puis un « avant / avec Realty ».'),
    ('09-parcours.html', 'Parcours', p09, 'Frise des 6 étapes', 'Concrète, orientée métier', 'Section dédiée', 'Une frise de la pige à la facture : chaque étape ouvre l’écran correspondant du logiciel.'),
    ('10-carrousel.html', 'Carrousel', p10, 'Grand titre + rail de cartes', 'Dynamique, produit', 'Dernière carte du rail', 'Un grand titre, puis un rail de cartes qui défile : le film, les 6 domaines, le site, l’application et le prix.'),
    ('11-editorial.html', 'Éditorial', p11, 'Très grande typographie', 'Premium, magazine', 'Bloc prix dans l’accueil', 'Une typographie de magazine, le film en grand format, puis les 6 domaines en chapitres numérotés.'),
]


def page(i, fn, name, body, doctype=True):
    prev = PAGES[i - 1][0] if i > 0 else 'index.html'
    nxt = PAGES[i + 1][0] if i + 1 < len(PAGES) else 'index.html'
    head = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Accueil Realty · {name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap">
<link rel="stylesheet" href="assets/realty.css">
<link rel="stylesheet" href="assets/menu.css">
<link rel="stylesheet" href="assets/accueil.css">
<link rel="stylesheet" href="pp.css">'''
    pres = f'''<div class="pres"><div class="pres-in"><span>Accueil · proposition {i + 6} / 11</span><b>{name}</b>
  <nav aria-label="Propositions"><a href="{prev}" data-prev>← Précédente</a><a href="index.html">Sommaire</a><a href="{nxt}" data-next>Suivante →</a></nav></div></div>'''
    html = f'''{head}
</head>
<body>
{SPRITE}
{pres}
{HEADER}
<main id="contenu">
{body}
</main>
{FOOTER}
<script src="assets/menu.js"></script>
<script src="assets/accueil.js"></script>
<script src="pp.js"></script>
'''
    return f'<!doctype html>\n<html lang="fr">\n<head>\n{html}</body>\n</html>\n'


def sommaire(doctype=True):
    cards = ''.join(f'''<a class="pp-card" href="{fn}">
  <div class="shots"><img class="d" src="captures/{fn[:-5]}.webp" alt="Aperçu ordinateur : {name}" width="1200" height="750" loading="lazy"><div class="ph"><img src="captures/mobile-{fn[:-5]}.webp" alt="Aperçu mobile : {name}" width="585" height="1266" loading="lazy"></div></div>
  <div class="body"><span class="num">Proposition {i + 6}</span><h3>{name}</h3><p>{desc}</p><ul class="tags"><li>{hero}</li><li>{mood}</li></ul><span class="go">Voir la page {ico("i-arrow")}</span></div></a>''' for i, (fn, name, _, hero, mood, price, desc) in enumerate(PAGES))
    rows = ''.join(f'<tr><th scope="row"><a href="{fn}"><span class="n">{i + 6}</span>{name}</a></th><td>{hero}</td><td>{mood}</td><td>{price}</td></tr>' for i, (fn, name, _, hero, mood, price, desc) in enumerate(PAGES))
    head = '''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Nouvelles propositions accueil Realty</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap">
<link rel="stylesheet" href="assets/realty.css">
<link rel="stylesheet" href="assets/accueil.css">
<link rel="stylesheet" href="pp.css">
<style>
body{font-family:"Manrope",ui-sans-serif,system-ui,sans-serif;background:#fff;color:var(--sx-ink)}
.so-top{border-bottom:1px solid var(--sx-line)}
.so-top .sx-wrap{display:flex;align-items:center;gap:16px;height:72px}
.so-top img{width:130px;height:auto}
.so-top span{margin-left:auto;font-size:14px;color:var(--sx-muted)}
.so-intro{padding-block:clamp(44px,6vw,76px) 32px}
.so-intro h1{margin-top:16px;font-size:clamp(32px,4.4vw,54px);font-weight:800;line-height:1.08;letter-spacing:-.03em;max-width:22ch;text-wrap:balance}
.so-intro p{margin-top:16px;font-size:17px;line-height:1.6;color:var(--sx-ink2);max-width:66ch}
.so-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;margin-bottom:64px}
.pp-card{display:flex;flex-direction:column;border:1px solid var(--sx-line);border-radius:22px;overflow:hidden;background:#fff;transition:border-color .3s,transform .4s var(--ease,ease)}
.pp-card:hover{border-color:var(--sx-violet);transform:translateY(-3px)}
.pp-card .shots{position:relative;background:var(--sx-bg2);padding:22px 22px 0;overflow:hidden}
.pp-card .shots .d{border-radius:12px 12px 0 0;box-shadow:0 10px 30px -18px rgba(20,27,51,.45);aspect-ratio:1200/750;object-fit:cover;object-position:top;width:100%}
.pp-card .ph{position:absolute;right:18px;bottom:-40px;width:23%;border-radius:20px;padding:5px;background:var(--sx-ink);box-shadow:0 20px 40px -20px rgba(20,27,51,.6)}
.pp-card .ph img{border-radius:15px;aspect-ratio:585/1266;object-fit:cover;object-position:top;width:100%}
.pp-card .body{padding:22px 24px 24px;display:flex;flex-direction:column;gap:8px}
.pp-card .num{font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--sx-violet)}
.pp-card h3{font-size:24px;font-weight:700;letter-spacing:-.02em}
.pp-card p{font-size:15px;line-height:1.55;color:var(--sx-ink2)}
.pp-card .tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
.pp-card .tags li{font-size:12.5px;font-weight:600;padding:5px 10px;border-radius:999px;background:var(--sx-bg);color:var(--sx-ink2)}
.pp-card .go{display:inline-flex;align-items:center;gap:6px;margin-top:6px;font-weight:700;font-size:15px}
.pp-card .go .i{width:18px;height:18px}
.so-h2{font-size:clamp(24px,2.8vw,32px);font-weight:700;letter-spacing:-.02em;margin-bottom:18px}
.so-table{overflow-x:auto;border:1px solid var(--sx-line);border-radius:18px;margin-bottom:20px}
.so-table table{width:100%;border-collapse:collapse;font-size:14.5px;min-width:720px}
.so-table th,.so-table td{padding:14px 18px;text-align:left;border-bottom:1px solid var(--sx-line)}
.so-table thead th{background:var(--sx-bg);font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--sx-muted)}
.so-table tbody tr:last-child th,.so-table tbody tr:last-child td{border-bottom:0}
.so-table tbody th a{display:inline-flex;align-items:center;gap:12px;font-weight:700;white-space:nowrap}
.so-table .n{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--sx-bg2);font-size:12.5px}
.so-note{font-size:14px;color:var(--sx-muted);margin-bottom:72px;max-width:80ch}
@media (max-width:900px){.so-grid{grid-template-columns:minmax(0,1fr)}}
</style>'''
    body = f'''{SPRITE}
<header class="so-top"><div class="sx-wrap"><img src="assets/img/logo-realty-bleu.webp" alt="Realty" width="130" height="30"><span>Refonte de realty.fr · Page d’accueil</span></div></header>
<main class="sx-wrap">
  <section class="so-intro"><span class="sx-pill">Propositions 6 à 11</span><h1>Six nouvelles compositions pour la page d’accueil</h1>
    <p>Ni accueil centré empilé, ni accueil texte à gauche / image à droite&#8239;: chaque page propose une autre façon d’ouvrir le site. Toutes reprennent le menu validé, la charte Realty, la vidéo et les mêmes contenus&#8239;; seule la composition change.</p></section>
  <h2 class="so-h2">Les 6 propositions</h2>
  <div class="so-grid">{cards}</div>
  <h2 class="so-h2">Comparatif</h2>
  <div class="so-table"><table><thead><tr><th scope="col">Proposition</th><th scope="col">Accueil</th><th scope="col">Ambiance</th><th scope="col">Mise en avant du prix</th></tr></thead><tbody>{rows}</tbody></table></div>
  <p class="so-note">Chaque page est complète, fonctionne sur mobile et se lit sans JavaScript. Dans chaque page, la bande sombre du haut permet de passer d’une proposition à l’autre (touches ← →).</p>
</main>'''
    if doctype:
        return f'<!doctype html>\n<html lang="fr">\n<head>\n{head}\n</head>\n<body>\n{body}\n</body>\n</html>\n'
    return f'{head}\n{body}\n'


if __name__ == '__main__':
    for i, (fn, name, fnc, *_rest) in enumerate(PAGES):
        open(os.path.join(HERE, fn), 'w', encoding='utf-8').write(page(i, fn, name, fnc()))
        print(fn)
    open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(sommaire())
    open(os.path.join(HERE, 'sommaire-artifact.html'), 'w', encoding='utf-8').write(sommaire(doctype=False))
    print('index.html')
