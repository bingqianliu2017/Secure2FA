interface CloseConfirmDialogProps {
  onMinimizeToTray: () => void;
  onQuit: () => void;
  onCancel: () => void;
}

/**
 * 关闭确认弹窗：最小化到托盘或退出
 */
export function CloseConfirmDialog({
  onMinimizeToTray,
  onQuit,
  onCancel,
}: CloseConfirmDialogProps) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="modal-title">关闭 Secure2FA</p>
        <p className="modal-desc">
          最小化到系统托盘（任务栏右侧区域），点击托盘图标可恢复
        </p>
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-primary" onClick={onMinimizeToTray}>
            最小化到托盘
          </button>
          <button type="button" className="modal-btn modal-btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="modal-btn modal-btn-danger" onClick={onQuit}>
            退出程序
          </button>
        </div>
      </div>
    </div>
  );
}
