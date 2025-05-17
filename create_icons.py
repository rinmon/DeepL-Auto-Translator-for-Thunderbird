from PIL import Image, ImageDraw, ImageFont
import os
import sys

# アイコンサイズ
sizes = [32, 48, 96]

# CHOTTO.NEWSブランドカラー
red = (255, 0, 0)  # #FF0000
blue = (0, 0, 255)  # #0000FF
white = (255, 255, 255)  # #FFFFFF

# アイコンフォルダの確認
icons_dir = "icons"
if not os.path.exists(icons_dir):
    os.makedirs(icons_dir)
    
# フォント取得のヘルパー関数
def get_font(size):
    # システムに応じたフォントを選択
    if sys.platform == 'darwin':  # macOS
        try:
            return ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", size)
        except IOError:
            try:
                return ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", size)
            except IOError:
                return ImageFont.load_default()
    else:  # その他のOS
        try:
            return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
        except IOError:
            return ImageFont.load_default()

# 各サイズのアイコンを生成
for size in sizes:
    # 新しい画像を作成（背景は透明）
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # 円形の背景を描画
    center = size // 2
    radius = size // 2
    draw.ellipse((0, 0, size-1, size-1), fill=red)
    
    # 中央の「DL」テキスト用のフォントサイズを設定
    font_size = size // 3
    font = get_font(font_size)

    # 青い円を描画（少し小さめ）
    inner_radius = int(radius * 0.75)
    draw.ellipse(
        (center - inner_radius, center - inner_radius, 
         center + inner_radius, center + inner_radius), 
        fill=blue
    )
    
    # テキスト「DL」を描画
    text = "DL"
    # Pillow 9.0.0以降の方法でテキストのサイズを取得
    left, top, right, bottom = font.getbbox(text)
    text_width = right - left
    text_height = bottom - top
    
    # テキストを描画
    draw.text(
        (center - text_width // 2, center - text_height // 2 - top // 2), 
        text,
        fill=white,
        font=font
    )
    
    # 右下に小さな「CN」ロゴを追加
    cn_size = size // 5
    cn_font = get_font(cn_size)
            
    cn_text = "CN"
    # Pillow 9.0.0以降の方法でテキストのサイズを取得
    left, top, right, bottom = cn_font.getbbox(cn_text)
    cn_width = right - left
    cn_height = bottom - top
    
    cn_x = size - cn_width - size // 10
    cn_y = size - cn_height - size // 10
    
    # CNの背景に小さな白い円を描画
    cn_circle_radius = cn_size
    draw.ellipse(
        (cn_x - cn_size//2, cn_y - cn_size//2, 
         cn_x + cn_width + cn_size//2, cn_y + cn_height + cn_size//2), 
        fill=white
    )
    
    # CNテキストを描画
    draw.text(
        (cn_x, cn_y - top // 2),
        cn_text,
        fill=blue,
        font=cn_font
    )
    
    # 画像を保存
    filename = f"icons/translate-{size}.png"
    image.save(filename)
    print(f"Created icon: {filename}")

print("All icons generated successfully!")
