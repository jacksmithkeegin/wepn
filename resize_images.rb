require 'fileutils'
require 'mini_magick'

# Define directories
base_dir = File.dirname(__FILE__)
big_dir = File.join(base_dir, 'assets', 'images', 'releases', 'big')
small_dir = File.join(base_dir, 'assets', 'images', 'releases', 'small')

# Ensure small directory exists
FileUtils.mkdir_p(small_dir)

# Clean small directory
Dir.glob(File.join(small_dir, '*')).each do |f|
  File.delete(f) if File.file?(f)
end

# Process each big image
Dir.glob(File.join(big_dir, '*')).each do |img_path|
  next unless File.file?(img_path)
  
  begin
    # Get file name and create small name
    filename = File.basename(img_path)
    name = File.basename(filename, '.*')
    ext = File.extname(filename)
    
    # Replace _big with _small in filename
    if name.include?('_big')
      small_name = name.gsub('_big', '_small')
    else
      small_name = "#{name}_small"
    end
    
    small_path = File.join(small_dir, "#{small_name}#{ext}")
    
    # Resize image
    image = MiniMagick::Image.open(img_path)
    
    # Calculate new dimensions (500px width)
    width = 500
    height = (image.height.to_f * (width.to_f / image.width.to_f)).to_i
    
    # Resize and save
    image.resize "#{width}x#{height}"
    image.write small_path
    
    puts "Resized: #{filename} -> #{small_name}#{ext}"
  rescue => e
    puts "Error processing #{filename}: #{e.message}"
  end
end

puts "Image resizing completed."
