import os
from PIL import Image

# Get the directory where the script is located
base_dir = os.path.dirname(os.path.abspath(__file__))
big_dir = os.path.join(base_dir, "images_big")
small_dir = os.path.join(base_dir, "images_small")

# Ensure images_small directory exists
os.makedirs(small_dir, exist_ok=True)

# 1. Delete all files in images_small
for fname in os.listdir(small_dir):
    fpath = os.path.join(small_dir, fname)
    if os.path.isfile(fpath):
        os.remove(fpath)

# 2. Process each image in images_big
for fname in os.listdir(big_dir):
    big_path = os.path.join(big_dir, fname)
    if not os.path.isfile(big_path):
        continue
    try:
        with Image.open(big_path) as img:
            w_percent = 500 / float(img.width)
            h_size = int(float(img.height) * w_percent)
            img_small = img.resize((500, h_size), Image.LANCZOS)
            name, ext = os.path.splitext(fname)
            # Replace _big with _small in the filename
            if "_big" in name:
                small_name = name.replace("_big", "_small")
            else:
                small_name = f"{name}_small"
            small_fname = f"{small_name}{ext}"
            small_path = os.path.join(small_dir, small_fname)
            img_small.save(small_path)
    except Exception as e:
        print(f"Error processing {fname}: {e}")
