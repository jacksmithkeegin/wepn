# WEPN - Wales Electronic Producers Network

This is the official website for the Wales Electronic Producers Network (WEPN), built with Jekyll.

## Development Setup

### Prerequisites

- Ruby 2.7 or newer
- Bundler
- Jekyll

### Installation

1. Install Ruby and Bundler
2. Clone this repository
3. Run `bundle install` to install dependencies
4. Run `bundle exec jekyll serve` to start the development server
5. Visit `http://localhost:4000` in your browser

### Directory Structure

```
wepn/
├── _config.yml              # Jekyll configuration
├── _data/                   # Data files (releases.yml)
├── _includes/               # Reusable components (header, footer, etc)
├── _layouts/                # Template layouts
├── assets/                  # Static assets
│   ├── css/                 # CSS stylesheets
│   ├── images/              # Images
│   │   └── releases/        # Release artwork
│   │       ├── big/         # Full-size artwork
│   │       └── small/       # Resized artwork for grid
│   └── js/                  # JavaScript files
├── Gemfile                  # Ruby dependencies
├── index.html               # Homepage
└── releases-data.html       # Generates releases JSON data
```

### Adding New Releases

1. Add new release information to `_data/releases.yml`
2. Add release artwork to `assets/images/releases/big/`
3. Run `ruby resize_images.rb` to generate small artwork
4. Build or serve the site to test the changes

### Building & Deploying

To build the site:

```
bundle exec jekyll build
```

This will generate the static site in the `_site` directory, ready for deployment.
