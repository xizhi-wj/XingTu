import argparse
import os
import py7zr
import requests
from tqdm import tqdm

def file_exists_check(file_path, extract_dir):
    """
    检查文件和解压目录是否已存在
    :param file_path: 要检查的文件路径
    :param extract_dir: 要检查的解压目录
    :return: (文件存在, 解压目录存在)
    """
    file_exist = os.path.isfile(file_path)
    
    # 从文件名获取子目录名（去掉.7z扩展名）
    base_name = os.path.basename(file_path)
    subdir_name = os.path.splitext(base_name)[0]
    subdir_path = os.path.join(extract_dir, subdir_name)
    dir_exist = os.path.isdir(subdir_path)
    
    return file_exist, dir_exist

def download_file(url, destination):
    """
    下载文件并显示进度条
    :param url: 远程文件URL
    :param destination: 本地保存路径
    :return: 下载是否成功
    """
    try:
        # 发起HTTP GET请求
        response = requests.get(url, stream=True)
        response.raise_for_status()  # 检查请求是否成功
        
        # 获取文件总大小
        total_size = int(response.headers.get('content-length', 0))
        
        # 使用tqdm显示下载进度
        with open(destination, 'wb') as file, tqdm(
            desc=os.path.basename(destination),
            total=total_size,
            unit='iB',
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for data in response.iter_content(chunk_size=1024):
                size = file.write(data)
                bar.update(size)
                
        print(f"文件已下载到: {destination}")
        return True
    except Exception as e:
        print(f"下载失败: {e}")
        return False

def extract_7z(file_path, extract_dir):
    """
    解压7z文件到以压缩文件名命名的子目录
    :param file_path: 7z文件路径
    :param extract_dir: 目标解压目录
    :return: 解压是否成功
    """
    try:
        # 从文件名获取子目录名（去掉.7z扩展名）
        base_name = os.path.basename(file_path)
        subdir_name = os.path.splitext(base_name)[0]
        subdir_path = os.path.join(extract_dir, subdir_name)
        
        # 确保解压目录存在
        os.makedirs(subdir_path, exist_ok=True)
        
        print(f"正在解压文件到: {subdir_path}")
        
        # 使用py7zr解压文件
        with py7zr.SevenZipFile(file_path, mode='r') as archive:
            archive.extractall(subdir_path)
            
        print("解压完成!")
        
        # 删除下载的7z文件
        os.remove(file_path)
        print(f"已删除下载的7z文件: {file_path}")
        
        return True
    except Exception as e:
        print(f"解压失败: {e}")
        return False

def main():
    # 设置命令行参数解析
    parser = argparse.ArgumentParser(description='下载并解压远程7z文件')
    parser.add_argument('url', help='远程7z文件的URL地址')
    parser.add_argument('directory', help='下载和解压的目标目录')
    args = parser.parse_args()
    
    # 确保目录存在
    os.makedirs(args.directory, exist_ok=True)
    
    # 从URL获取文件名
    file_name = os.path.basename(args.url)
    if not file_name.endswith('.7z'):
        print("错误: URL必须指向一个.7z文件")
        return
    file_name = "Final2x-core.7z"
    # 完整的本地文件路径
    local_file_path = os.path.join(args.directory, file_name)
    
    # 检查文件和解压目录是否已存在
    _, dir_exist = file_exists_check(local_file_path, args.directory)
    
    # 如果解压目录已存在，直接返回
    if dir_exist:
        print(f"解压目录已存在，跳过下载和解压步骤")
        return
    
    # 下载文件
    if download_file(args.url, local_file_path):
        # 解压文件（解压函数会自动删除下载的7z文件）
        extract_7z(local_file_path, args.directory)
    
    print("操作完成!")

if __name__ == '__main__':
    main()