/**
 * Tauri 桌面端：系统托盘 + 关闭时最小化到托盘
 * 仅在 Tauri 环境中执行
 */
export async function initTauriTray() {
  if (typeof (window as Window & { __TAURI__?: unknown }).__TAURI__ === "undefined") return;

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  const { TrayIcon } = await import("@tauri-apps/api/tray");
  const { defaultWindowIcon } = await import("@tauri-apps/api/app");
  const { Menu } = await import("@tauri-apps/api/menu");

  const appWindow = getCurrentWindow();
  const icon = await defaultWindowIcon();

  const tray = await TrayIcon.new({
    icon: icon ?? undefined,
    tooltip: "Secure2FA",
    showMenuOnLeftClick: false,
    action: async (event) => {
      if (event.type === "Click" && "button" in event && event.button === "Left") {
        const visible = await appWindow.isVisible();
        if (visible) {
          await appWindow.hide();
        } else {
          await appWindow.show();
          await appWindow.setFocus();
        }
      }
    },
  });

  const menu = await Menu.new({
    items: [
      {
        id: "show",
        text: "显示主窗口",
        action: async () => {
          await appWindow.show();
          await appWindow.setFocus();
        },
      },
      {
        id: "quit",
        text: "退出",
        action: async () => {
          await appWindow.destroy();
        },
      },
    ],
  });
  await tray.setMenu(menu);

  appWindow.onCloseRequested(async (ev) => {
    ev.preventDefault();
    await appWindow.hide();
  });
}
