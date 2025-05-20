from PIL import Image
import pillow_avif
import pillow_heif
from pillow_heif import register_heif_opener
import argparse
import os
import sys
import uuid
from typing import Optional, Tuple

register_heif_opener()
def generate_unique_hash(length: int = 8) -> str:
    """生成一个唯一的哈希值
    
    Args:
        length: 哈希值长度，默认为8
        
    Returns:
        返回十六进制格式的哈希字符串
    """
    return uuid.uuid4().hex[:length]

def handle_transparency(image: Image.Image) -> Image.Image:
    """处理透明背景，转换为白色背景
    
    Args:
        image: 输入的PIL图像对象
        
    Returns:
        处理后的图像对象
    """
    if image.mode == 'RGBA':
        background = Image.new('RGB', image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[3])
        return background
    elif image.mode == 'LA':
        background = Image.new('L', image.size, 255)
        background.paste(image, mask=image.split()[1])
        return background
    return image

def get_output_filename(input_path: str, output_path: str, target_format: str) -> Tuple[str, str]:
    """生成输出文件名和完整路径
    
    Args:
        input_path: 输入文件路径
        output_path: 输出目录路径
        target_format: 目标格式
        
    Returns:
        (基础文件名, 完整输出路径)
    """
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    unique_name = f"{base_name}_{generate_unique_hash()}.{target_format.lower()}"
    
    # 确保输出目录存在
    if output_path and not os.path.exists(output_path):
        os.makedirs(output_path)
    
    return base_name, os.path.join(output_path, unique_name)

def format_image(input_path: str, output_path: str, target_format: str) -> Optional[str]:
    """格式化图片
    
    Args:
        input_path: 输入文件路径
        output_path: 输出目录路径
        target_format: 目标格式
        
    Returns:
        成功返回输出文件路径，失败返回None
    """
    try:
        # 打开图片并处理
        with Image.open(input_path) as img:
            base_name, new_output_path = get_output_filename(input_path, output_path, target_format)
            
            # 格式特定处理
            format_lower = target_format.lower()
            print(f"图片保存至: {new_output_path}")
            
            if format_lower in ('jpg', 'jpeg'):
                img = handle_transparency(img)
                img = img.convert('RGB')
                img.save(new_output_path, 'JPEG', quality=95)
            elif format_lower == 'ico':
                sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
                if max(img.size) > 256:
                    img.thumbnail((256, 256), Image.LANCZOS)
                img.save(new_output_path, format='ICO', sizes=sizes)
            elif format_lower in ('tif', 'tiff'):
                img.save(new_output_path, 'TIFF', compression='tiff_lzw')
            elif format_lower == 'avif':
                img.save(new_output_path, 'AVIF', quality=80)
            elif format_lower == 'heic':
                # 使用 pillow_heif 保存为 HEIC
                heif_img = pillow_heif.from_pillow(img)
                heif_img.save(new_output_path, quality=90)  # quality 可选 (1-100)
            else:
                img.save(new_output_path, format_lower.upper())
            
            return new_output_path
    
    except Exception as e:
        print(f"处理图片出错: {str(e)}", file=sys.stderr)
        return None


def main():
    parser = argparse.ArgumentParser(description="图片格式转换工具")
    parser.add_argument('input', help="输入文件或模式(如*.png)")
    parser.add_argument('output', help="输出目录")
    parser.add_argument('format', help="目标格式(jpg/png/gif等)")
    args = parser.parse_args()
    print(args.input, args.output, args.format)
    sucess = format_image(args.input, args.output, args.format)
    sys.exit(0 if sucess else 1)
    

if __name__ == "__main__":
    
    main()