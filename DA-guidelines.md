# SOAR - Direction Artistique (DA)
## Design System & Guidelines

**Date de création:** 16 Août 2025  
**Projet:** SOAR Landing Page  
**Thème:** Minimal, Élégant, OpenAI-inspired  

---

## 🎨 IDENTITÉ VISUELLE

### **Concept Central**
- **Style:** Minimaliste élégant type OpenAI
- **Promesse:** Dit en 5 secondes la valeur et pousse vers "Launch a demo"
- **Philosophie:** Grille visuelle simple, hairlines fines, beaucoup d'espace blanc

---

## 🎯 PALETTE DE COULEURS

### **Couleurs Principales**
```css
--canvas: #FFFFFF           /* Fond principal */
--text-primary: #0A0A0A     /* Texte principal (noir) */
--text-secondary: #6B7280   /* Texte secondaire (gris) */
--dividers: #E5E7EB         /* Séparateurs/hairlines/bordures */
--dotted-border: #D1D5DB    /* Bordures pointillées (3-step) */
--cta-background: #0A0A0A   /* Fond CTA (noir solide) */
--cta-text: #FFFFFF         /* Texte CTA (blanc) */
--grid-dots: #E5E7EB        /* Points de la grille hero */
```

### **Couleurs Fonctionnelles**
```css
--hover-bg: #FAFAFA         /* Fond hover subtil */
--who-section-bg: linear-gradient(135deg, #FAFBFC 0%, #F8F9FA 100%)
```

---

## 📝 TYPOGRAPHIE

### **Police Principale**
- **Famille:** Inter (Google Fonts)
- **Fallback:** -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Poids disponibles:** 400 (Regular), 500 (Medium), 700 (Bold)

### **Hiérarchie des Tailles**
```css
/* Titres */
--h1-size: 48px             /* Titre hero (desktop) */
--h1-size-mobile: 32px      /* Titre hero (mobile) */
--section-title: 28px       /* Titres de sections */
--feature-title: 18px       /* Titres de features */
--process-title: 20px       /* Titres du process */

/* Textes */
--subhead-size: 16px        /* Sous-titres */
--body-size: 16px           /* Texte principal */
--small-size: 13px          /* Petits textes */
--metric-chip: 11px         /* Puces métriques */
```

### **Poids des Polices**
- **H1 et titres de sections:** Medium (500) - plus léger que Bold
- **Titres de features/process:** Medium (500)
- **Texte regular:** Regular (400)
- **CTA buttons:** Medium (500)

---

## 📐 LAYOUT & SPACING

### **Largeurs & Conteneurs**
```css
--max-width: 1140px         /* Largeur max du contenu */
--section-spacing: 120px    /* Espacement vertical sections */
--column-gap: 32px          /* Espacement entre colonnes */
--base-unit: 8px            /* Unité de base (multiples de 8) */
```

### **Espacements Spécifiques**
- **Header height:** 72px
- **Hero min-height:** 600px
- **Process boxes gap:** 48px
- **ICP tags gap:** 16px (desktop), 12px (mobile)

---

## 🔘 RADII & BORDURES

### **Rayons de Bordure**
```css
--card-radius: 16px         /* Cartes générales */
--dotted-radius: 16px       /* Boîtes 3-step (pointillées) */
--cta-radius: 12px          /* Boutons CTA */
--icp-tag-radius: 20px      /* Pills ICP */
--metric-chip-radius: 8px   /* Puces métriques */
```

### **Bordures**
```css
--hairline: 1px             /* Lignes fines */
--dashed-border: 2px dashed /* Bordures pointillées 3-step */
--solid-border: 1px solid   /* Bordures solides */
```

---

## ⚡ DYNAMISME & ANIMATIONS

### **Timing des Animations**
```css
/* Transitions standards */
--transition-fast: 180ms-220ms ease-out
--transition-standard: 250ms ease-out
--transition-slow: 300ms ease

/* Animations spécifiques */
--slider-duration: 30s linear infinite
--flow-dot-duration: 4s ease-in-out infinite
--fade-duration: 0.8s ease-out
```

### **Effets Dynamiques**

#### **1. AI Companies Slider**
- **Animation continue** (30s, mouvement horizontal)
- **Triple duplication** pour boucle seamless
- **Effet grayscale → color** au hover

#### **2. Hero Background**
- **Grille de points** avec effet spotlight
- **Gradient radial:** transparent au centre → fade vers les bords
- **Taille des points:** 10px × 10px

#### **3. Process Flow Animation**
- **Ligne connectrice** entre les 3 étapes
- **Point animé** qui traverse la ligne (4s de cycle)
- **Effet fluide** sans interruption

#### **4. Staggered Entrances**
- **Who section:** Délais progressifs (0.3s → 2.0s)
- **ICP tags:** Animation individuelle (0.6s → 1.7s)
- **fadeInUp:** translateY(10px) → translateY(0)

### **Micro-Interactions**
```css
/* Boutons */
--button-hover: +8% brightness, translateY(-1px)
--button-shadow: 0 4px 16px rgba(10, 10, 10, 0.15)

/* Links */
--link-hover: underline + opacity 0.8

/* Tags */
--tag-hover: translateY(-2px) + scale(1.02) + border-color change
```

---

## 🏗️ STRUCTURE DES SECTIONS

### **1. Header**
- **Logo SOAR** (sans ligne décorative)
- **Navigation:** Features · Process · Team
- **Hairline divider** en bas

### **2. Hero**
- **Titre principal** + sous-titre centré
- **CTA primary:** "Launch a demo"
- **Micro-trust:** "No signup · No integration required"
- **Background:** Grille de points avec effet spotlight

### **3. AI Companies Slider**
- **Section dédiée** entre Hero et Features
- **Logos AI:** OpenAI, Anthropic, Gemini, Mistral, DeepSeek, Perplexity
- **Animation continue** horizontal

### **4. Features**
- **4 colonnes** avec séparateurs verticaux
- **Titres + descriptions** alignés gauche
- **Responsive:** 4→2→1 colonnes

### **5. Who It's For**
- **Background subtil** (gradient très léger)
- **Titre question:** "Who it's for?"
- **12 ICP tags** en pills outline
- **CTA secondary:** "Launch a demo" (noir)
- **Tagline:** "Get your real baseline in 60 seconds"

### **6. Process (3-Step)**
- **Boîtes pointillées** avec animation de flow
- **Metric chips** sous chaque titre
- **Animation:** point qui voyage entre les étapes

### **7. Footer**
- **3 colonnes:** Logo+tagline, Navigation, Copyright
- **Minimal:** Seulement l'essentiel
- **Links:** Features, Process, Privacy, Terms

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints**
```css
/* Desktop */
≥ 1200px: Layout complet (4 colonnes features, 3 colonnes process)

/* Tablet */
768px-1199px: Features 2×2, Process ajusté

/* Mobile */
< 768px: 
- H1: 32px
- Sections: 1 colonne
- Padding réduit
- Navigation verticale
```

### **Ajustements Mobile**
- **Supprimer séparateurs verticaux** features
- **ICP tags:** Gap réduit, police plus petite
- **Process:** Empilage vertical
- **Footer:** Layout centré vertical

---

## ♿ ACCESSIBILITÉ

### **Contraste**
- **Texte principal:** ≥ 4.5:1 ratio
- **Texte secondaire:** Maintient lisibilité
- **Focus states:** Outline 2px noir

### **Navigation**
- **Liens soulignés** au hover
- **Scroll smooth** pour ancres
- **Alt texts** appropriés

### **Motion**
- **Respect prefers-reduced-motion**
- **Animations non-essentielles** désactivables

---

## 🎯 PRINCIPES DE DESIGN

### **Minimalisme**
- **Pas de dégradés complexes**
- **Pas d'ombres fortes**
- **Pas d'illustrations stock**
- **Palette monochrome** (noir/blanc/gris)

### **Hiérarchie Visuelle**
- **Espacement généreux** entre sections
- **Tailles de police** progressives
- **Poids de police** cohérents (500 max pour titres)

### **Élégance**
- **Hairlines fines** (1px)
- **Radii cohérents** (multiples logiques)
- **Transitions fluides** (ease-out)
- **Grille de 8px** pour tous espacements

---

## 📋 CHECKLIST DE COHÉRENCE

### **✅ Couleurs**
- [ ] Toutes les couleurs respectent la palette définie
- [ ] Contrast ratios > 4.5:1
- [ ] Pas de couleurs d'accent autres que noir/gris

### **✅ Typographie**
- [ ] Inter utilisé partout
- [ ] Poids max: 500 (pas de Bold sauf exceptions)
- [ ] Tailles respectent la hiérarchie définie

### **✅ Spacing**
- [ ] Multiples de 8px pour tous espacements
- [ ] Section spacing: 120px (desktop), 80px (mobile)
- [ ] Padding cohérent dans composants similaires

### **✅ Animations**
- [ ] Timing cohérent (180-300ms pour micro, 4-30s pour macro)
- [ ] ease-out pour la plupart des transitions
- [ ] Respect prefers-reduced-motion

### **✅ Composants**
- [ ] Radii cohérents par type de composant
- [ ] États hover définis pour tous éléments interactifs
- [ ] Focus states pour accessibilité

---

## 📁 ORGANISATION DES FICHIERS

```
SOAR/
├── templates/          # Version finale du site
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── img/               # Assets images
│   ├── SOAR.jpg       # Logo principal
│   ├── open ai.png    # Logos AI companies
│   ├── anthropic.png
│   ├── GEMINI.png
│   ├── logo-mistral.png
│   ├── DeepSeek_logo.png
│   └── Perplexity_AI_logo.png
└── DA-guidelines.md   # Ce document
```

---

## 🚀 ÉVOLUTIONS FUTURES

### **Éléments à Maintenir**
- **Cohérence des couleurs** (palette noir/blanc/gris)
- **Typographie Inter** avec poids ≤ 500
- **Animations fluides** et subtiles
- **Espacement généreux** (multiples de 8px)

### **Zones d'Extension**
- **Nouvelles sections:** Suivre pattern existant
- **Nouveaux composants:** Reprendre radii et spacing
- **Nouvelles animations:** Respecter timing établi
- **Responsive:** Maintenir breakpoints définis

---

*Document créé pour maintenir la cohérence visuelle et technique du projet SOAR. À consulter pour toute modification ou extension du design system.*
