import { useState, useEffect } from "react";
import { getTOTPCode, getRemainingSeconds, getProgress } from "../core/totp";

/**
 * TOTP 验证码 + 倒计时 Hook
 * 每秒刷新，用于驱动进度条和 code 显示
 */
export function useTOTP(secret: string) {
  const [code, setCode] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!secret) {
      setCode("------");
      setRemainingSeconds(30);
      setProgress(1);
      return;
    }

    const tick = async () => {
      const c = await getTOTPCode(secret);
      setCode(c);
      setRemainingSeconds(getRemainingSeconds());
      setProgress(getProgress());
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [secret]);

  return { code, remainingSeconds, progress };
}
