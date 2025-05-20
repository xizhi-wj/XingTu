import os
import shutil
import sys

def move_and_delete(source_path, destination_path):
    try:
        # 检查源文件是否存在
        if not os.path.exists(source_path):
            print(f"错误：源文件 '{source_path}' 不存在")
            return False
        
        # 确保目标目录存在，如果不存在则创建
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)
        
        # 移动文件（复制然后删除原始文件）
        shutil.move(source_path, destination_path)
        
        print(f"文件已成功从 '{source_path}' 移动到 '{destination_path}'")
        return True
        
    except Exception as e:
        print(f"移动文件时出错: {e}")
        return False

if __name__ == "__main__":    
    source = sys.argv[1]
    destination = sys.argv[2]
    
    if move_and_delete(source, destination):
        sys.exit(0)
    else:
        sys.exit(1)