module Jekyll
  class ArtistPageGenerator < Generator
    safe true

    def generate(site)
      if site.data['artists']
        site.data['artists'].each do |artist|
          site.pages << ArtistPage.new(site, site.source, artist)
        end
      end
    end
  end

  class ArtistPage < Page
    def initialize(site, base, artist)
      @site = site
      @base = base
      @dir = 'artists'
      @name = "#{artist['slug']}.html"

      self.process(@name)
      self.data = {}
      self.data['layout'] = 'artist'
      self.data['title'] = artist['title'] || artist['name']
      self.data['artist'] = artist
      
      # Set individual fields for easy access in templates
      artist.each do |key, value|
        self.data[key] = value
      end
    end
  end
end
