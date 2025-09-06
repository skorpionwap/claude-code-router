# 🎨 Themes Plugin v1.0.0

A comprehensive theme system for claude-code-router with 3 beautiful, unified themes: **Light**, **Dark**, and **Advanced** (Glassmorphism).

## ✨ Features

- **3 Unified Themes**: Light (professional), Dark (eye-friendly), Advanced (glassmorphism)
- **Complete Component Coverage**: All UI elements styled consistently 
- **Plugin Architecture**: Easy to enable/disable, modular design
- **Auto-persistence**: Theme preferences saved automatically
- **System Theme Detection**: Optional auto-sync with OS theme
- **CSS Variables**: Modern, performant styling system
- **Accessibility**: Full support for high contrast and reduced motion
- **Mobile Optimized**: Responsive design with touch-friendly interactions

## 🚀 Quick Start

### 1. Enable the Plugin

In your `~/.claude-code-router/config.json`, add:

```json

  "plugins": {
    "themes": {
      "enabled": true,
      "activeTheme": "light",
      "availableThemes": ["light", "dark", "advanced"],
      "persistUserChoice": true,
      "autoApplySystemTheme": false
    }
  }

```

### 2. Activate in UI

1. Open Settings (⚙️ icon)
2. Toggle "Enhanced Themes" switch
3. Select your preferred theme
4. Changes are applied instantly!

## 🎭 Available Themes

### 🌞 Light Theme
- **Perfect for**: Daytime use, professional environments
- **Colors**: Clean whites, subtle grays, blue accents
- **Features**: High contrast, sharp borders, professional look
- **Best for**: Presentations, documentation, extended reading

### 🌙 Dark Theme  
- **Perfect for**: Low-light environments, extended coding sessions
- **Colors**: Deep grays, soft whites, gentle blue accents
- **Features**: Easy on eyes, reduced strain, elegant appearance
- **Best for**: Night work, focus sessions, creative tasks

### ✨ Advanced Theme
- **Perfect for**: Modern, stunning visual experience
- **Colors**: Gradient backgrounds, glassmorphism effects
- **Features**: Backdrop blur, animated elements, premium feel
- **Best for**: Demos, showcases, impressive presentations

## 📝 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable the themes plugin |
| `activeTheme` | `'light' \| 'dark' \| 'advanced'` | `'light'` | Currently active theme |
| `availableThemes` | `Array` | `['light', 'dark', 'advanced']` | Themes available for selection |
| `persistUserChoice` | `boolean` | `true` | Save theme choice to localStorage |
| `autoApplySystemTheme` | `boolean` | `false` | Auto-switch based on OS theme |

### Example Configurations

**Minimal Setup:**
```json
{
  "plugins": {
    "themes": {
      "enabled": true
    }
  }
}
```

**Dark Mode Only:**
```json
{
  "plugins": {
    "themes": {
      "enabled": true,
      "activeTheme": "dark",
      "availableThemes": ["dark"]
    }
  }
}
```

**Auto System Theme:**
```json
{
  "plugins": {
    "themes": {
      "enabled": true,
      "autoApplySystemTheme": true,
      "availableThemes": ["light", "dark"]
    }
  }
}
```

## 🛠️ Technical Details

### Architecture

```
plugins/themes/
├── index.ts              # Main plugin entry & API
├── types/index.ts        # TypeScript definitions  
├── contexts/ThemeContext.tsx  # React context & state
├── components/ThemeSelector.tsx  # UI selector component
└── styles/
    ├── variables.css     # CSS custom properties
    ├── components.css    # Component-specific styles
    └── themes.css        # Main theme definitions
```

### CSS Variables System

Each theme defines consistent variables:

```css
.theme-light {
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.2 0 0);
  --primary: oklch(0.5 0.15 220);
  /* ... 30+ variables */
}
```

### Component Coverage

All UI elements are themed consistently:

- ✅ **Buttons** (primary, secondary, ghost, destructive)
- ✅ **Inputs** (text, select, textarea, focus states)
- ✅ **Cards** (backgrounds, borders, shadows)
- ✅ **Modals** (dialogs, popovers, overlays)
- ✅ **Tables** (headers, rows, hover states)
- ✅ **Badges** (success, error, warning, info, neutral)
- ✅ **Loading** (spinners, skeleton loaders)
- ✅ **Switches** (toggles, checkboxes)
- ✅ **Notifications** (toasts, alerts)
- ✅ **Scrollbars** (WebKit and Firefox)

## 🔧 API Reference

### Plugin API

```typescript
import { themesPlugin } from './plugins/themes';

// Get current theme
const currentTheme = themesPlugin.getCurrentTheme(); // 'light' | 'dark' | 'advanced'

// Set theme
themesPlugin.setTheme('dark');

// Get configuration
const config = themesPlugin.getConfig();

// Update configuration  
themesPlugin.setConfig({
  activeTheme: 'advanced',
  persistUserChoice: true
});
```

### React Hooks

```typescript
import { useTheme } from './plugins/themes/contexts/ThemeContext';
import { useThemesPlugin } from './plugins/themes';

function MyComponent() {
  // Full context access
  const { currentTheme, setTheme, themes, pluginConfig } = useTheme();
  
  // Simple plugin access
  const { setTheme, getCurrentTheme, isEnabled } = useThemesPlugin();
  
  return (
    <div>
      <p>Current theme: {currentTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>
    </div>
  );
}
```

## 🎨 Customization

### Adding Custom Themes

Extend the theme definitions in `contexts/ThemeContext.tsx`:

```typescript
const CUSTOM_THEME: ThemeDefinition = {
  id: 'custom',
  name: 'My Custom Theme',
  description: 'A personalized theme',
  colors: {
    background: 'your-color',
    foreground: 'your-color',
    // ... define all required colors
  },
  features: {
    glassmorphism: false,
    animations: true,
    gradients: false
  }
};
```

### CSS Overrides

Create theme-specific overrides:

```css
.theme-advanced .my-component {
  background: var(--gradient-primary);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] **Theme Switching**: All 3 themes switch correctly
- [ ] **Persistence**: Theme choice survives page refresh
- [ ] **Components**: All UI components display properly in each theme
- [ ] **Animations**: Smooth transitions between themes
- [ ] **Accessibility**: Focus states visible in all themes
- [ ] **Mobile**: Responsive design on mobile devices
- [ ] **Settings UI**: Plugin toggle works in SettingsDialog

### Browser Compatibility

- ✅ **Chrome** 90+ (full support)
- ✅ **Firefox** 88+ (full support)  
- ✅ **Safari** 14+ (full support)
- ✅ **Edge** 90+ (full support)

## 🔄 Migration & Updates

### From Existing Themes

If you have custom theme modifications:

1. **Backup** your existing theme files
2. **Enable** the themes plugin
3. **Configure** available themes in config.json
4. **Test** each theme with your content
5. **Customize** using CSS overrides if needed

### Future Updates

The plugin is designed for easy updates:

- **CSS Variables**: Changes automatically apply to all components
- **Modular Architecture**: Update individual components without affecting others  
- **Backward Compatibility**: Existing configurations continue to work

### Update Steps

1. **Backup** current plugin directory
2. **Replace** plugin files with new version
3. **Check** config.json for new options
4. **Test** theme switching functionality
5. **Apply** any custom overrides if needed

## 🐛 Troubleshooting

### Theme Not Applying

**Problem**: Theme colors not showing
**Solutions**:
- Check if plugin is enabled in config.json
- Verify CSS files are loading (check browser dev tools)
- Ensure ThemeProvider wraps your components

### Settings Not Saving

**Problem**: Theme resets after refresh  
**Solutions**:
- Verify `persistUserChoice: true` in config
- Check browser localStorage permissions
- Clear localStorage and try again

### Performance Issues

**Problem**: Slow theme switching
**Solutions**:
- Disable animations: `prefers-reduced-motion: reduce`
- Use Light/Dark themes instead of Advanced
- Check for conflicting CSS

### Styling Conflicts

**Problem**: Components not styled correctly
**Solutions**:
- Check CSS specificity conflicts
- Verify CSS custom properties are defined
- Use browser dev tools to inspect applied styles

## 📞 Support

- **Issues**: Report bugs and feature requests
- **Documentation**: This README and inline code comments  
- **Examples**: Check `components/ThemeSelector.tsx` for usage patterns

## 🎯 Roadmap

### v1.1.0 (Planned)
- [ ] Theme preview in settings
- [ ] Custom theme creator UI
- [ ] Import/export theme configurations
- [ ] More animation options

### v1.2.0 (Future)
- [ ] Seasonal themes
- [ ] Time-based theme switching
- [ ] Component-specific theme overrides
- [ ] Theme sharing system

---

**Built with ❤️ for claude-code-router**  
*Unified, beautiful, performant theme system*