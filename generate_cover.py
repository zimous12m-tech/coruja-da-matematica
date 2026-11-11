from pathlib import Path
import subprocess
import sys

print("A verificar a biblioteca Pillow...")
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("A instalar Pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

print("A criar a imagem...")
width, height = 1200, 630
img = Image.new('RGB', (width, height), color='#6c5ce7')
draw = ImageDraw.Draw(img)

# Fundo com gradiente simples
for y in range(height):
    r = int(108 + (72 - 108) * (y / height))
    g = int(92 + (52 - 92) * (y / height))
    b = int(231 + (212 - 231) * (y / height))
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Tenta usar uma fonte fixe, senao usa a padrao
try:
    font_title = ImageFont.truetype("seguisb.ttf", 90)
    font_sub = ImageFont.truetype("segoeui.ttf", 40)
except IOError:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()

title = "Coruja Matematica"
subtitle = "Aprende a jogar! 6.º Ano"

# Desenha o texto no centro
bbox = draw.textbbox((0, 0), title, font=font_title)
text_w = bbox[2] - bbox[0]
draw.text(((width - text_w) / 2, 220), title, font=font_title, fill="#fdcb6e")

bbox_sub = draw.textbbox((0, 0), subtitle, font=font_sub)
text_w_sub = bbox_sub[2] - bbox_sub[0]
draw.text(((width - text_w_sub) / 2, 340), subtitle, font=font_sub, fill="#ffffff")

# Desenha uma coruja simples em SVG/Texto
draw.text((width/2 - 40, 80), "🦉", font=ImageFont.truetype("seguiemj.ttf", 100) if Path("C:/Windows/Fonts/seguiemj.ttf").exists() else font_title, fill="#ffffff")

# Guarda a imagem na pasta public
Path("public").mkdir(exist_ok=True)
img.save("public/og-image.png")
print("✅ Imagem criada com sucesso em public/og-image.png")