# CSS Refactoring Documentation

## Overview
The monolithic `globals.css` file (2000+ lines) has been refactored into modular, component-focused CSS files for better maintainability and organization.

## Directory Structure
```
src/app/
├── globals.css          (Root, imports, and base styles/variables)
└── styles/
    ├── hero.css         (Hero carousel, title, category navigation)
    ├── navigation.css   (Top nav, search bar, mobile hamburger menu)
    ├── grid.css         (News grid, cards, CTA, pagination)
    ├── articles.css     (Article sections, metadata, highlights)
    ├── factcheck.css    (Fact-check cards, verdict badges, breaking banner)
    └── footer.css       (Footer layout and typography)
```

## File Descriptions

### `styles/hero.css`
- Hero wrapper (2-column responsive layout)
- Hero image and content sections
- Category navigation buttons
- **Hero title mobile fix**: `.hero-title-mobile-hidden` class with `display: none`, `visibility: hidden`, and `height: 0` for mobile screens
- Carousel controls and indicators
- Title hiding on mobile via media queries (`@media max-width: 768px`)

### `styles/navigation.css`
- Top navigation links (hidden on mobile)
- Search bar and search button styling
- Mobile hamburger menu button
- Mobile navigation slideout with animations (`slideIn`, `fadeIn`)
- Mobile nav sections and article links
- Animations and hover effects

### `styles/grid.css`
- News grid (3-col → 2-col → 1-col responsive)
- News cards with hover effects
- Card image responsive heights
- Card body typography and metadata
- CTA section styling
- Pagination buttons and numbers
- All card animations and transitions

### `styles/articles.css`
- Article section titles with brand borders
- Article card grid layout
- Article image and category badges
- Article body typography
- Article metadata (author, date)
- Highlight sections ("À la Une", etc.)

### `styles/factcheck.css`
- Fact-check list container
- Fact-check cards with verdict-specific colors
- Verdict badges (verified/disputed/false) with gradients
- Breaking news banner with animations
- Breaking banner icon pulse animation

### `styles/footer.css`
- Footer dark background and layout
- Footer grid columns (auto-fit)
- Footer typography (h4, h5, paragraphs)
- Link hover effects
- Footer logo styling
- Copyright section

### `globals.css`
- Root CSS variables (colors, spacing, transitions, shadows, border-radius)
- Theme configuration for Tailwind CSS v4
- Base HTML/body styles
- Container max-width and responsive padding
- Keyframe animations (pulse, slideIn, fadeIn)
- **Import statements** for all modular CSS files

## Mobile Optimization Details

### Hero Title Mobile Fix
The hero carousel title now has multiple layers of hiding on mobile:
```css
/* Primary hide via class */
.hero-title-mobile-hidden {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Backup hide at 768px breakpoint */
@media (max-width: 768px) {
  .hero-title-mobile-hidden {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
  }
  .hero-content h1 {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 0 !important;
  }
}
```

### Responsive Image Heights
- **Desktop**: 200px
- **Tablet (768px)**: 180px
- **Mobile (480px)**: 150px
- **Extra small (375px)**: 140px

### Grid Responsive Columns
- **Desktop**: 3 columns
- **Tablet (1024px)**: 2 columns
- **Mobile (768px)**: 1 column

## Benefits of This Structure

1. **Separation of Concerns**: Each CSS file handles one component/section
2. **Easier Maintenance**: Find and modify styles for specific components quickly
3. **Reduced Duplication**: No mixed concerns - rules are more organized
4. **Better Performance**: Can potentially lazy-load non-critical CSS in future
5. **Team Collaboration**: Multiple developers can work on different component styles simultaneously
6. **Scalability**: Easy to add new components or modify existing ones

## Import Order
The import order in `globals.css` matters for CSS cascade/specificity:
1. Tailwind CSS (base utility framework)
2. Component CSS modules (in dependency order)
3. CSS variables and base styles (defined in globals)

## Browser Support
- All styles use standard CSS (no hacks needed)
- Webkit prefixes included where needed (`-webkit-line-clamp`)
- CSS Grid and Flexbox supported in all modern browsers
- Mobile-first responsive design (mobile styles first, then media queries for larger screens)

## Testing Checklist
- [ ] Desktop layout displays correctly (3-column grid)
- [ ] Tablet layout displays correctly (2-column grid)
- [ ] Mobile layout displays correctly (1-column grid)
- [ ] Hero title is hidden on mobile devices
- [ ] Search bar and navigation work on mobile
- [ ] Fact-check cards display with correct verdict colors
- [ ] Footer displays correctly on all screen sizes
- [ ] All hover animations work smoothly
- [ ] No visual regressions compared to original styling

## Future Improvements
- Consider extracting animations to a separate `animations.css` file
- Consolidate utility classes into a `utilities.css` file
- Consider CSS-in-JS solution for dynamic styling needs
- Monitor performance and consider code-splitting CSS by page route
