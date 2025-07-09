// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::fs::File;
use std::io::{Write};
use std::path::PathBuf;
use std::path::Path;
use tauri::command;
use reqwest;
use std::fs;


#[command]
async fn save_image(
    blob_data: Vec<u8>,  // 接收二进制数据
    file_name: String,   // 接收文件名
    directory: String,   // 接收目录路径
) -> Result<(), String> {
    // 构建完整路径
    let mut path = PathBuf::from(directory);
    path.push(file_name);
    
    // 确保目录存在
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    
    // 写入文件
    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    file.write_all(&blob_data).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[command]
async fn delete_path(path: String) -> Result<bool, String> {
    let path = Path::new(&path);
    
    // 如果路径不存在，直接返回 false
    if !path.exists() {
        return Ok(false);
    }

    let result = if path.is_file() {
        // 删除文件
        std::fs::remove_file(path).is_ok()
    } else if path.is_dir() {
        // 递归删除文件夹及其内容
        std::fs::remove_dir_all(path).is_ok()
    } else {
        false
    };
    
    Ok(result)
}

#[command]
async fn extract_zip(zip_path: String, output_dir: String) -> Result<bool, String> {
    // 确保输出目录存在
    if let Err(e) = fs::create_dir_all(&output_dir) {
        return Err(format!("创建输出目录失败: {}", e));
    }
    
    let os_type = std::env::consts::OS;
    
    let status = match os_type {
        "macos" | "linux" => {
            // 在 macOS 和 Linux 上使用 unzip 命令
            let output = std::process::Command::new("unzip")
                .arg("-o") // 覆盖已存在的文件
                .arg(&zip_path)
                .arg("-d")
                .arg(&output_dir)
                .output()
                .map_err(|e| e.to_string())?;
                
            output.status.success()
        },
        "windows" => {
            // 在 Windows 上使用 PowerShell 的 Expand-Archive 命令
            let output = std::process::Command::new("powershell")
                .arg("-Command")
                .arg(format!("Expand-Archive -Path \"{}\" -DestinationPath \"{}\" -Force", zip_path, output_dir))
                .output()
                .map_err(|e| e.to_string())?;
                
            output.status.success()
        },
        _ => return Err(format!("不支持的操作系统: {}", os_type)),
    };
    
    if status {
        // 解压成功后删除 zip 文件
        if let Err(e) = std::fs::remove_file(&zip_path) {
            return Err(format!("解压成功但删除 zip 文件失败: {}", e));
        }
        Ok(true)
    } else {
        Err("解压失败".to_string())
    }
}

#[command]
async fn download_zip(url: String, save_path: String) -> Result<String, String> {
    // 确保保存目录存在
    if let Some(parent) = Path::new(&save_path).parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            return Err(format!("创建保存目录失败: {}", e));
        }
    }
    
    // 发起 HTTP 请求下载文件
    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("下载请求失败: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("下载请求失败，状态码: {}", response.status()));
    }
    
    // 创建文件
    let mut file = File::create(&save_path)
        .map_err(|e| format!("创建文件失败: {}", e))?;
    
    // 将响应内容写入文件
    let content = response.bytes()
        .await
        .map_err(|e| format!("读取响应内容失败: {}", e))?;
    
    file.write_all(&content)
        .map_err(|e| format!("写入文件失败: {}", e))?;
    
    Ok(save_path)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save_image, delete_path, extract_zip, download_zip])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

