from PIL import Image, ImageDraw, ImageFont
import os

OUT_PATH = os.path.join(os.path.dirname(__file__), 'ddi_flow.png')

W, H = 1200, 720
img = Image.new('RGBA', (W, H), 'white')
draw = ImageDraw.Draw(img)

def load_font(size):
    try:
        return ImageFont.truetype('arial.ttf', size)
    except Exception:
        return ImageFont.load_default()

label_f = load_font(20)
small_f = load_font(14)

def rect(x, y, w, h, fill, radius=10):
    draw.rounded_rectangle([x, y, x+w, y+h], radius=radius, fill=fill, outline='#333', width=2)

def text_center(x, y, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text((x - w/2, y - h/2), text, fill='#111', font=font)

def arrow(x1, y1, x2, y2):
    draw.line((x1, y1, x2, y2), fill='#333', width=3)
    # simple arrowhead
    from math import atan2, sin, cos, pi
    ang = atan2(y2-y1, x2-x1)
    ah = 10
    ang1 = ang + pi*3/4
    ang2 = ang - pi*3/4
    xA = x2 + ah * cos(ang1)
    yA = y2 + ah * sin(ang1)
    xB = x2 + ah * cos(ang2)
    yB = y2 + ah * sin(ang2)
    draw.polygon([(x2, y2), (xA, yA), (xB, yB)], fill='#333')

# Nodes positions and sizes (matching requested mermaid layout)
rect(60, 60, 260, 80, fill='#f9f1ff')
text_center(190, 100, 'Proposed Medication List', label_f)

rect(420, 60, 220, 80, fill='#fff7e6')
text_center(530, 100, 'Query Hash Table', label_f)

rect(700, 60, 240, 80, fill='#e8f6ff')
text_center(820, 100, 'Lookup Interacting Pairs', label_f)

rect(420, 200, 260, 100, fill='#ffecec', radius=20)
text_center(550, 235, 'Interaction Found?', label_f)
text_center(550, 260, '(dangerous / clinically significant)', small_f)

rect(60, 360, 260, 80, fill='#e8ffe8')
text_center(190, 400, 'Approve Medication', label_f)

rect(420, 360, 260, 80, fill='#ffdede')
text_center(550, 400, 'Alert User', label_f)

rect(760, 300, 300, 80, fill='#fff6d9')
text_center(910, 335, 'Suggest Alternatives', label_f)
text_center(910, 355, 'or adjust dosages / avoid combo', small_f)

rect(760, 420, 300, 80, fill='#fff6d9')
text_center(910, 455, 'Advise Doctor Consultation', label_f)

# Arrows (approximate positions)
arrow(320, 100, 420, 100)
arrow(640, 100, 700, 100)
arrow(820, 140, 820, 200)
arrow(550, 300, 550, 360)

arrow(490, 300, 320, 300)
arrow(320, 300, 320, 400)
arrow(320, 400, 190, 400)

arrow(610, 300, 760, 300)

arrow(550, 400, 760, 400)
arrow(820, 380, 820, 320)
arrow(820, 460, 820, 420)

draw.text((60, 680), 'Flowchart: Drug-Drug Interaction (DDI) checking — queries a precomputed hash table of interacting pairs; alerts and suggests alternatives when dangerous interactions detected.', fill='#111', font=small_f)

img.save(OUT_PATH)
print('Saved PNG to', OUT_PATH)
