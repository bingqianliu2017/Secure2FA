import { useState, useEffect, useRef } from "react";
import { getTOTPCode, getRemainingSeconds, getProgress } from "../core/totp";

/**
 * TOTP 验证码 + 倒计时 Hook
 * 每秒仅更新进度条（同步、单次 setState），验证码仅在 30 秒窗口切换时重新计算
 */
export function useTOTP(secret: string) {
  const [code, setCode] = useState("");
  const [tickState, setTickState] = useState({ remainingSeconds: 30, progress: 1 });
  const lastWindowRef = useRef(-1);

  useEffect(() => {
    if (!secret) {
      setCode("------");
      setTickState({ remainingSeconds: 30, progress: 1 });
      return;
    }

    const tick = () => {
      const now = Date.now();
      const windowIndex = Math.floor(now / 1000 / 30);
      const rs = getRemainingSeconds();
      const p = getProgress();

      setTickState({ remainingSeconds: rs, progress: p });

      if (windowIndex !== lastWindowRef.current) {
        lastWindowRef.current = windowIndex;
        getTOTPCode(secret).then(setCode);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [secret]);

  return { code, remainingSeconds: tickState.remainingSeconds, progress: tickState.progress };
}
