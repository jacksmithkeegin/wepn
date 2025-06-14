module Jekyll
  class ReleasePageGenerator < Generator
    safe true

    def generate(site)
      if site.data['releases']
        site.data['releases'].each do |release|
          site.pages << ReleasePage.new(site, site.source, release)
        end
      end    end
  end

  class ReleasePage < Page
    def initialize(site, base, release)
      @site = site
      @base = base
      @dir = 'releases'
        # Use the title.en as the URL slug
      release_slug = create_slug_from_title(release['title']['en'])
      @name = "#{release_slug}.html"
      
      self.process(@name)
      self.data = {}
      self.data['layout'] = 'release'
      self.data['title'] = "#{release['title']['en']} by #{release['artists']['en']} | WEPN"
      self.data['release'] = release
      self.data['release_id'] = release['release_code']['en']
        # Add SEO description
      if release['description'] && release['description']['en']
        self.data['description'] = "#{release['description']['en']} Listen to #{release['title']['en']} by #{release['artists']['en']} on WEPN."
      else
        self.data['description'] = "#{release['title']['en']} by #{release['artists']['en']} - Electronic music release from WEPN (Wales Electronic Producers Network)."
      end
    end

    private

    def create_slug_from_title(title)
      title.downcase
           .gsub(/[^a-z0-9\s-]/, '') # Remove special characters except spaces and hyphens
           .gsub(/\s+/, '-')         # Replace spaces with hyphens
           .gsub(/-+/, '-')          # Replace multiple hyphens with single hyphen
           .gsub(/^-|-$/, '')        # Remove leading/trailing hyphens
    end
  end
end
