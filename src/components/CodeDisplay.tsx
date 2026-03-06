import { useTOTP } from "../hooks/useTOTP";

interface CodeDisplayProps {
  secret: string;
  onCopy?: () => void;
}

/**
 * 验证码显示 + 底部逐渐变空的进度条
 */
export function CodeDisplay({ secret, onCopy }: CodeDisplayProps) {
  const { code, remainingSeconds, progress } = useTOTP(secret);

  const handleClick = async () => {
    if (code && code !== "------") {
      await navigator.clipboard.writeText(code);
      onCopy?.();
    }
  };

  return (
    <div className="code-display">
      <button
        type="button"
        className="code-value"
        onClick={handleClick}
        title="点击复制"
      >
        {code}
      </button>
      <div className="code-progress-container">
        <div
          className="code-progress-fill"
          style={{ width: `${progress * 100}%` }}
          role="progressbar"
          aria-valuenow={remainingSeconds}
          aria-valuemin={0}
          aria-valuemax={30}
        />
      </div>
      <span className="code-remaining">剩余 {remainingSeconds} 秒</span>
    </div>
  );
}
