# IT Support Portal - Design Guide

## Visual Design Reference

This guide documents the visual design system implemented in the IT Support Portal, inspired by Grok AI (X.AI).

---

## 🎨 Color System

### Background Colors
```css
Primary Background:   #0A0A0A (near black)
Secondary Background: #1A1A1A (dark gray)
Tertiary Background:  #2A2A2A (medium gray)
```

### Border Colors
```css
Primary Border:   #333333
Secondary Border: #404040
```

### Text Colors
```css
Primary Text:   #FFFFFF (white)
Secondary Text: #A0A0A0 (light gray)
Muted Text:     #666666 (medium gray)
```

### Accent Colors
```css
Blue:   #3B82F6 (primary actions, links)
Purple: #8B5CF6 (gradients, highlights)
Green:  #10B981 (success, high relevance)
Amber:  #F59E0B (warnings, medium relevance)
Red:    #EF4444 (errors, stop actions)
```

### Gradients
```css
Primary Gradient:  linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)
Glow Gradient:     linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)
Message Gradient:  linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)
```

---

## 📝 Typography

### Font Family
```css
Primary: 'Inter', system-ui, -apple-system, sans-serif
Code:    'Fira Code', monospace
```

### Font Sizes
```css
Hero:    36px (text-4xl)
Title:   24px (text-2xl)
Body:    16px (text-base)
Small:   14px (text-sm)
Tiny:    12px (text-xs)
```

### Font Weights
```css
Regular:  400 (font-normal)
Medium:   500 (font-medium)
Semibold: 600 (font-semibold)
Bold:     700 (font-bold)
```

---

## 📐 Spacing & Layout

### Container Widths
```css
Max Container:  1280px (max-w-5xl)
Message Width:  80-85% of container
```

### Padding Scale
```css
Small:   16px (p-4)
Medium:  24px (p-6)
Large:   32px (p-8)
```

### Border Radius
```css
Small:  8px  (rounded-lg)
Medium: 12px (rounded-xl)
Large:  16px (rounded-2xl)
XLarge: 24px (rounded-3xl)
Full:   9999px (rounded-full)
```

---

## 🎭 Component Specifications

### 1. Header Component
```
Height: 64px-72px
Position: Fixed top
Background: bg-black/80 with backdrop-blur-xl
Border: border-b border-white/10

Logo Icon:
- Size: 40px × 40px
- Background: gradient-to-br from-blue-600 to-purple-600
- Border Radius: rounded-xl
- Shadow: shadow-glow-blue

Title:
- Font Size: 18px (text-lg)
- Font Weight: 600 (font-semibold)
- Gradient: from-blue-400 to-purple-400

Buttons:
- Padding: px-4 py-2
- Background: bg-white/5 hover:bg-white/10
- Border: border-white/10 hover:border-blue-500/50
```

### 2. Welcome Screen
```
Layout: Centered vertically and horizontally
Min Height: 70vh

Hero Icon:
- Size: 80px × 80px
- Background: gradient-to-br from-blue-600 to-purple-600
- Border Radius: rounded-3xl
- Animation: bounce-slow

Headline:
- Font Size: 36px-48px (text-4xl md:text-5xl)
- Font Weight: 700 (font-bold)
- Gradient: from-blue-400 via-purple-400 to-pink-400

Suggested Prompts:
- Grid: 1 column mobile, 2 columns tablet+
- Background: bg-white/5 hover:bg-white/10
- Border: border-white/10 hover:border-blue-500/50
- Padding: p-6
- Border Radius: rounded-2xl
- Hover: scale-105 with shadow-glow-sm
```

### 3. Message Bubbles

#### User Message (Right-aligned)
```
Alignment: ml-auto (right)
Max Width: 80-85%
Background: gradient-to-br from-blue-600 to-blue-700
Text Color: white
Border Radius: rounded-2xl rounded-br-sm
Shadow: shadow-lg shadow-blue-500/20
Animation: slide-in-from-right (300ms)

Avatar:
- Size: 24px × 24px
- Background: bg-white/10
- Icon: User icon from Lucide
```

#### AI Message (Left-aligned)
```
Alignment: mr-auto (left)
Max Width: 80-85%
Background: bg-zinc-900/80 with backdrop-blur
Border: border-white/10
Text Color: text-primary
Border Radius: rounded-2xl rounded-bl-sm
Shadow: shadow-lg shadow-blue-500/10
Animation: slide-in-from-left (300ms)

Avatar:
- Size: 24px × 24px
- Background: gradient-to-br from-blue-600 to-purple-600
- Icon: Bot icon from Lucide
- Shadow: shadow-glow-sm
```

### 4. Source Citations
```
Container:
- Margin Top: mt-4
- Border Top: border-t border-white/10
- Padding Top: pt-4

Header (Clickable):
- Background: bg-white/5 hover:bg-white/10
- Padding: p-3
- Border Radius: rounded-lg
- Icon: FileText (Lucide)

Source Cards:
- Background: bg-white/5 hover:bg-white/10
- Border: border-white/10 hover:border-blue-500/30
- Padding: p-4
- Border Radius: rounded-xl
- Margin: mt-2

Relevance Colors:
- 80-100%: text-green-400, bg-green-500/10, border-green-500/30
- 60-79%:  text-blue-400, bg-blue-500/10, border-blue-500/30
- 40-59%:  text-amber-400, bg-amber-500/10, border-amber-500/30
- <40%:    text-text-muted, bg-white/5, border-white/10
```

### 5. Input Area
```
Position: Fixed bottom
Background: bg-black/90 with backdrop-blur-xl
Border: border-t border-white/10
Padding: p-4
Shadow: shadow-2xl
Z-index: 40

Textarea Container:
- Background: bg-zinc-900/80
- Border: border-2 border-white/10
- Focus Border: border-blue-500/50
- Focus Ring: ring-4 ring-blue-500/20
- Border Radius: rounded-2xl
- Padding: p-4 pr-14

Gradient Border Effect (on focus):
- Absolute positioned: -inset-0.5
- Background: gradient-to-r from-blue-600 to-purple-600
- Opacity: 0 (default), 100 (focus)
- Blur: blur
- Transition: 300ms

Send Button:
- Size: 40px × 40px (w-10 h-10)
- Background: gradient-to-br from-blue-600 to-purple-600
- Border Radius: rounded-full
- Shadow: shadow-glow-blue
- Hover: scale-105
- Disabled: opacity-50, cursor-not-allowed

Character Count:
- Font Size: 12px (text-xs)
- Color: text-text-muted
- Position: Bottom right
```

### 6. Typing Indicator
```
Container: flex gap-1

Dots (3):
- Size: 8px × 8px (w-2 h-2)
- Background: bg-blue-500
- Border Radius: rounded-full
- Animation: pulse with stagger
  - Dot 1: 0s delay
  - Dot 2: 0.2s delay
  - Dot 3: 0.4s delay
```

### 7. Scroll to Bottom Button
```
Position: Fixed bottom-24 right-6
Size: 48px × 48px (w-12 h-12)
Background: bg-zinc-800 hover:bg-zinc-700
Border: border-white/20
Border Radius: rounded-full
Shadow: shadow-lg
Z-index: 30
Animation: fade-in
Hover: scale-105

Visibility:
- Show: When scrolled up >200px
- Hide: When at bottom
```

---

## 🎬 Animations

### Message Animations
```css
User Message Entry:
- Animation: slide-in-from-right
- Duration: 300ms
- Easing: ease-out
- Transform: translateX(20px) → translateX(0)
- Opacity: 0 → 1

AI Message Entry:
- Animation: slide-in-from-left
- Duration: 300ms
- Easing: ease-out
- Transform: translateX(-20px) → translateX(0)
- Opacity: 0 → 1

Streaming Text:
- Per word delay: 30ms
- Fade in: 150ms
- Cursor blink: 1s interval
```

### Button Interactions
```css
Hover:
- Transform: scale(1.05)
- Duration: 200ms
- Shadow: Add glow

Active/Click:
- Transform: scale(0.95)
- Duration: 100ms
```

### Loading States
```css
Typing Dots:
- Scale: 0.8 → 1.2
- Opacity: 0.3 → 1
- Duration: 600ms
- Stagger: 200ms between dots

Button Spinner:
- Rotation: 360deg continuous
- Duration: 1s
- Easing: linear
```

---

## 📱 Responsive Breakpoints

### Desktop (1024px+)
```css
Container: max-w-5xl (1280px)
Padding: px-8
Suggested Prompts: 2 columns
Message Width: 80%
```

### Tablet (768px - 1023px)
```css
Container: max-w-full
Padding: px-6
Suggested Prompts: 2 columns
Message Width: 85%
```

### Mobile (<768px)
```css
Container: max-w-full
Padding: px-4
Suggested Prompts: 1 column
Message Width: 90%
Font Sizes: Slightly reduced
Header: Compact layout
```

---

## ♿ Accessibility

### Focus States
```css
All Interactive Elements:
- Ring: ring-2 ring-blue-500
- Outline: outline-none (replaced with ring)
- Visible: Always visible on focus
```

### Color Contrast
```css
Text on Dark Background:
- Primary Text (#FFFFFF): 21:1 ratio ✅
- Secondary Text (#A0A0A0): 7.5:1 ratio ✅
- Muted Text (#666666): 4.5:1 ratio ✅

Interactive Elements:
- Minimum: 3:1 ratio ✅
```

### Keyboard Navigation
```
Tab Order:
1. Header actions (New Chat, Settings)
2. Suggested prompts (if visible)
3. Message actions (Copy, Regenerate)
4. Scroll to bottom button
5. Input textarea
6. Send button

Shortcuts:
- Enter: Send message
- Shift+Enter: New line
- Escape: Close modals (future)
```

---

## 🎯 Design Principles

### 1. **Clarity**
- Clear visual hierarchy
- Obvious interactive elements
- Consistent spacing and alignment

### 2. **Elegance**
- Subtle gradients and glows
- Smooth animations
- Glass morphism effects

### 3. **Performance**
- GPU-accelerated animations
- Optimized re-renders
- Efficient CSS with Tailwind

### 4. **Accessibility**
- Keyboard navigation
- Screen reader support
- High contrast ratios

### 5. **Responsiveness**
- Mobile-first approach
- Fluid layouts
- Touch-friendly targets

---

## 🚀 Implementation Notes

### Tailwind Configuration
All design tokens are defined in `tailwind.config.js`:
- Custom colors in `theme.extend.colors`
- Custom gradients in `theme.extend.backgroundImage`
- Custom shadows in `theme.extend.boxShadow`
- Custom animations in `theme.extend.animation`

### Component Structure
Each component is self-contained with:
- Props for customization
- Tailwind classes for styling
- Lucide React icons
- Proper accessibility attributes

### Performance Optimization
- Tailwind purges unused CSS in production
- Components use React.memo where appropriate
- Animations use transform and opacity (GPU-accelerated)
- Lazy loading for future enhancements

---

## 📚 Resources

- **Tailwind CSS:** https://tailwindcss.com/docs
- **Lucide React:** https://lucide.dev/guide/packages/lucide-react
- **Inter Font:** https://fonts.google.com/specimen/Inter
- **Grok AI Reference:** https://x.ai/

---

**Last Updated:** 2025-10-28
**Version:** 2.0.0
**Status:** Production Ready ✅

