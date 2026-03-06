use tauri::{
  menu::{Menu, MenuItem},
  tray::{TrayIconBuilder, TrayIconEvent},
  Manager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let handle = app.handle().clone();
      let icon = app
        .default_window_icon()
        .cloned()
        .expect("default icon missing");

      let show_i = MenuItem::with_id(&handle, "show", "显示主窗口", true, None::<&str>)?;
      let quit_i = MenuItem::with_id(&handle, "quit", "退出", true, None::<&str>)?;
      let menu = Menu::with_items(&handle, &[&show_i, &quit_i])?;

      let tray_handle = handle.clone();
      let tray = TrayIconBuilder::with_id("main_tray")
        .icon(icon)
        .menu(&menu)
        .tooltip("Secure2FA")
        .on_tray_icon_event(move |_icon, event| {
          if let TrayIconEvent::Click {
            button: tauri::tray::MouseButton::Left,
            button_state: tauri::tray::MouseButtonState::Up,
            ..
          } = event
          {
            if let Some(w) = tray_handle.get_webview_window("main") {
              let visible = w.is_visible().unwrap_or(true);
              if visible {
                let _ = w.hide();
              } else {
                let _ = w.show();
                let _ = w.set_focus();
              }
            }
          }
        })
        .on_menu_event(move |app, event| match event.id.as_ref() {
          "show" => {
            if let Some(w) = app.get_webview_window("main") {
              let _ = w.show();
              let _ = w.set_focus();
            }
          }
          "quit" => {
            app.exit(0);
          }
          _ => {}
        })
        .build(&handle)?;

      let _ = tray;

      Ok(())
    })
    .on_window_event(|window, event| {
      if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        let _ = window.hide();
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
