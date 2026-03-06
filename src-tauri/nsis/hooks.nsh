; Secure2FA NSIS 自定义卸载钩子
; 卸载时删除 AppData 中的密钥文件，确保敏感数据一并清除

; PREUNINSTALL: 在卸载开始时就删除（应用可能仍在运行，若文件被占用会失败）
!macro NSIS_HOOK_PREUNINSTALL
  ${If} $UpdateMode <> 1
    SetShellVarContext current
    IfFileExists "$APPDATA\${BUNDLEID}\*.*" 0 +2
    RmDir /r "$APPDATA\${BUNDLEID}"
  ${EndIf}
!macroend

; POSTUNINSTALL: 卸载结束时再次尝试删除（此时应用已关闭，更可靠）
!macro NSIS_HOOK_POSTUNINSTALL
  ${If} $UpdateMode <> 1
    SetShellVarContext current
    IfFileExists "$APPDATA\${BUNDLEID}\*.*" 0 +2
    RmDir /r "$APPDATA\${BUNDLEID}"
  ${EndIf}
!macroend
