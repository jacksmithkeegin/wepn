module Jekyll
  class ReleasePageGenerator < Generator
    safe true

    def generate(site)
      if site.data['releases']
        site.data['releases'].each do |release|
          site.pages << ReleasePage.new(site, site.source, release)
        end
      end
    end
  end

  class ReleasePage < Page
    def initialize(site, base, release)
      @site = site
      @base = base
      @dir = 'releases'
      
      # Use the release_code.en as the URL slug
      release_slug = release['release_code']['en'].downcase.gsub('_', '-')
      @name = "#{release_slug}.html"

      self.process(@name)
      self.data = {}
      self.data['layout'] = 'release'
      self.data['title'] = "#{release['title']['en']} - WEPN"
      self.data['release'] = release
      self.data['release_id'] = release['release_code']['en']
      
      # Set individual fields for easy access in templates
      release.each do |key, value|
        self.data[key] = value
      end
    end
  end
end
