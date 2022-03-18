#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use std::{fmt::Debug, fs};

use serde::Serialize;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_dir,
            get_hostname,
            read_text_file,
            read_binary_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize, Debug, Clone)]
pub struct FsItem {
    path: Vec<String>,
    fs_type: String,
}

#[tauri::command]
async fn read_dir(path: String) -> Vec<FsItem> {
    let items = fs::read_dir(path).unwrap();

    let mut out_items: Vec<FsItem> = vec![];
    for item in items {
        let item_u = item.unwrap();
        let path = item_u.path().into_os_string().into_string().unwrap();
        let fs_type_f = item_u.file_type().unwrap();

        let mut s: Vec<_> = path.split('/').map(ToString::to_string).collect();
        s[0] = String::from("/");

        out_items.push(FsItem {
            path: s,
            fs_type: if fs_type_f.is_file() {
                String::from("-")
            } else if fs_type_f.is_dir() {
                String::from("d")
            } else if fs_type_f.is_symlink() {
                String::from("l")
            } else {
                String::from("o")
            },
        });
    }

    out_items
}

#[tauri::command]
async fn get_hostname() -> String {
    hostname::get().unwrap().into_string().unwrap()
}

#[tauri::command]
async fn read_text_file(path: String) -> String {
    fs::read_to_string(path).unwrap()
}

#[tauri::command]
async fn read_binary_file(path: String) -> Vec<u8> {
    fs::read(path).unwrap()
}
