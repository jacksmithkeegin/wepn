# WEPN - Wales Electronic Producers Network

The official website for the Wales Electronic Producers Network (WEPN) - a dynamic, bilingual Jekyll site featuring music releases, audio player integration, and responsive design.

## Features

- **Bilingual Support**: Full English/Welsh language switching
- **Dynamic Release Management**: Automatic upcoming and featured release display
- **Audio Player Integration**: Embedded Bandcamp player with seamless release selection
- **Individual Release Pages**: Detailed pages for each release with dynamic routing
- **Responsive Design**: Mobile-friendly with touch navigation
- **Multi-Environment Deployment**: Supports GitHub Pages, Netlify, and local development
- **SEO Optimized**: Social media metadata and structured data

## Development Setup

### Prerequisites

- **Ruby 2.7+** with DevKit
- **Bundler** gem
- **Jekyll** 4.3+
- **Node.js** (optional, for Sharp image processing)

### Quick Start (Windows)

For Windows users, use the provided helper scripts:

1. **Using PowerShell** (recommended):
   ```powershell
   .\run-jekyll.ps1
   ```

2. **Using Command Prompt**:
   ```cmd
   run-jekyll.bat
   ```

These scripts will automatically check dependencies, install missing components, and start the development server.

### Manual Installation

1. **Install Ruby with DevKit** from [RubyInstaller](https://rubyinstaller.org/downloads/)
2. **Clone this repository**
3. **Install dependencies**:
   ```bash
   bundle install
   ```
4. **Install Node.js dependencies** (optional, for image processing):
   ```bash
   npm install
   ```
5. **Start development server**:
   ```bash
   bundle exec jekyll serve
   ```
6. **Visit** `http://localhost:4000/wepn/` in your browser

> **Note**: If you encounter issues, see `jekyll-troubleshooting.md` for detailed setup instructions and common problem solutions.

### Project Structure

```
wepn/
├── _config.yml              # Main Jekyll configuration
├── _config_netlify.yml      # Netlify-specific overrides
├── netlify.toml             # Netlify deployment settings
├── _data/                   # Site data
│   ├── releases.yml         # Release information (source of truth)
│   └── display_config.yml   # Homepage display settings
├── _includes/               # Reusable components
│   ├── header.html          # Site header with navigation
│   ├── footer.html          # Site footer
│   ├── head.html            # HTML head section
│   ├── player-bar.html      # Audio player component
│   └── baseurl-script.html  # Environment-specific asset handling
├── _layouts/                # Page templates
│   └── default.html         # Main page layout
├── assets/                  # Static assets
│   ├── css/
│   │   └── styles.css       # Main stylesheet
│   ├── images/              # Site images and favicons
│   │   └── releases/        # Release artwork
│   │       ├── big/         # Full-size artwork (1000x1000)
│   │       └── small/       # Grid thumbnails (300x300)
│   └── js/                  # JavaScript files
│       ├── app.js           # Main application logic
│       ├── translations.js  # Bilingual text content
│       ├── releases-data.json      # Generated release data
│       └── display-config-data.json # Generated display settings
├── Gemfile                  # Ruby dependencies
├── package.json             # Node.js dependencies (optional)
├── run-jekyll.ps1          # Windows PowerShell helper script
├── run-jekyll.bat          # Windows Command Prompt helper script
├── resize_images.rb        # Ruby image processing script
├── resize_images.js        # Node.js image processing script
├── jekyll-troubleshooting.md # Detailed setup guide
├── index.html              # Homepage
├── releases-data.html      # Generates releases JSON
└── display-config-data.html # Generates display config JSON
```

## Content Management

### Adding New Releases

1. **Add release data** to `_data/releases.yml`:
   ```yaml
   - release_code:
       en: PRODUCT_XXX_TITLE
     title:
       en: "Release Title"
       cy: "Teitl Rhyddhad"  # Welsh translation
     artists:
       en: "Artist Name"
     release_date:
       en: "Month Day, Year"
       cy: "Day Month Year"
     description:
       en: "Release description"
       cy: "Disgrifiad rhyddhad"
     # ... additional fields
   ```

2. **Add artwork**:
   - Add full-size artwork (1000x1000px) to `assets/images/releases/big/`
   - Name it: `PRODUCT_XXX_TITLE_big.jpg`

3. **Generate thumbnails**:
   - **Ruby method**: `ruby resize_images.rb`
   - **Node.js method**: `node resize_images.js`

4. **Test the changes**:
   ```bash
   bundle exec jekyll serve
   ```

### Managing Homepage Display

Edit `_data/display_config.yml` to control:

- **Upcoming Release Panel**: Show/hide and select which release appears
- **Featured Release**: Choose automatic (most recent) or manual selection
- **Release Modes**: 
  - `nextUp`: Automatically show earliest future release
  - `manual`: Show specific release by code
  - `mostRecent`: Show most recent past release

### Language Management

- **Release content**: Add Welsh translations to `_data/releases.yml`
- **UI text**: Modify `assets/js/translations.js`
- **Default language**: Based on browser settings (falls back to English)

## Deployment

### GitHub Pages

The site automatically deploys to GitHub Pages when changes are pushed to the main branch. Configuration in `_config.yml` handles the `/wepn` subpath.

**Live site**: `https://[username].github.io/wepn/`

### Netlify

For production deployment with custom domain:

1. **Connect repository** to Netlify
2. **Build settings** are configured in `netlify.toml`:
   - Build command: `bundle exec jekyll build --config _config.yml,_config_netlify.yml`
   - Publish directory: `_site`
3. **Environment variables**:
   - `RUBY_VERSION`: `3.2.0`
   - `JEKYLL_ENV`: `production`

The Netlify configuration removes the `/wepn` baseurl for custom domains.

### Local Building

To build the site for production:

```bash
# For GitHub Pages (with baseurl)
bundle exec jekyll build

# For custom domain (no baseurl)
bundle exec jekyll build --config _config.yml,_config_netlify.yml
```

Output will be generated in the `_site` directory.

## Technical Details

### Audio Player

- **Integration**: Embedded Bandcamp player with dynamic track loading
- **Controls**: Release selection, play/pause, track navigation
- **Mobile Support**: Touch-friendly player bar with responsive design

### Routing & Navigation

- **Hash-based routing**: Support for direct links to releases
- **Individual release pages**: Dynamic routing with `#release/PRODUCT_XXX`
- **Tab navigation**: Home, Music, About, Contact sections
- **Back navigation**: Context-aware return to previous section

### Performance

- **Lazy loading**: Images load only when needed
- **Asset optimization**: Environment-specific asset paths
- **Responsive images**: Automatic thumbnail generation
- **Caching**: Browser cache optimization for static assets

### Bilingual Implementation

- **Dynamic switching**: No page reload required
- **Content preservation**: Language switching maintains current page state
- **Fallback system**: Welsh content falls back to English if not available
- **SEO friendly**: Proper `lang` attributes and meta tags

## Contributing

### Code Structure

- **Modular CSS**: Component-based styling in `assets/css/styles.css`
- **ES6 JavaScript**: Modern JavaScript in `assets/js/app.js`
- **Data-driven**: Content managed through YAML files
- **Responsive first**: Mobile-first design approach

### Development Workflow

1. **Make changes** to source files
2. **Test locally** with `bundle exec jekyll serve --livereload`
3. **Check responsiveness** across different screen sizes
4. **Verify bilingual functionality** by switching languages
5. **Test audio player** with different releases
6. **Commit and push** to trigger automatic deployment

## Troubleshooting

For detailed troubleshooting and setup issues, see:
- `jekyll-troubleshooting.md` - Comprehensive setup guide
- Common issues with Ruby installation on Windows
- Jekyll build and deployment problems
- Node.js and image processing setup

## License

This project is part of the Wales Electronic Producers Network (WEPN).
