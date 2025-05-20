import os
import shutil
import sys

def delete_path(target_path):
    try:
        # 检查路径是否存在
        if not os.path.exists(target_path):
            print(f"错误：路径 '{target_path}' 不存在")
            return False
        
        # 如果是文件，直接删除
        if os.path.isfile(target_path):
            os.remove(target_path)
            print(f"文件 '{target_path}' 已成功删除")
            return True
        
        # 如果是目录，递归删除整个目录树
        elif os.path.isdir(target_path):
            shutil.rmtree(target_path)
            print(f"文件夹 '{target_path}' 及其内容已成功删除")
            return True
        
        # 其他情况（如符号链接等）
        else:
            print(f"错误：'{target_path}' 不是常规文件或文件夹")
            return False
            
    except Exception as e:
        print(f"删除路径时出错: {e}")
        return False

if __name__ == "__main__":
    target = sys.argv[1]
    print(target)
    if delete_path(target):
        sys.exit(0)
    else:
        sys.exit(1)