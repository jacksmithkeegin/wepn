source "https://rubygems.org"

# Specify Ruby version to ensure consistency
ruby ">= 2.7.0", "< 3.3.0"

gem "jekyll", "~> 4.3.2"
gem "mini_magick", "~> 4.12.0" # For image resizing

# If you have any plugins, put them here!
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17.0"
  gem "jekyll-seo-tag", "~> 2.8.0"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# Performance-booster for watching directories on Windows
# gem "wdm", "~> 0.1.1", platforms: [:mingw, :mswin, :x64_mingw] if Gem.win_platform?

# For development and testing
group :development do
  gem "webrick", "~> 1.8" # Required for Ruby 3+ as it's no longer bundled
end