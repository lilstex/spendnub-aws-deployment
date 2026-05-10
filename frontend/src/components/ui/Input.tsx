import { useEffect, useRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  endIcon?: React.ReactNode;
  hint?: string;
  error?: string;
}
export const Input = ({
  label,
  endIcon,
  hint,
  error,
  className,
  style,
  ...props
}: InputProps) => {
  const isPassword = props.type === "password";
  const inputRef = useRef<HTMLInputElement>(null);

  const { value, onChange, ...restProps } = props as InputProps & {
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  };

  useEffect(() => {
    if (isPassword && inputRef.current && value !== undefined) {
      // Update the native input value directly — bypasses React's prop system
      if (inputRef.current.value !== value) {
        inputRef.current.value = value;
      }
    }
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 7,
        width: "100%",
      }}
    >
      {label && (
        <label
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "#4a7fa5",
            fontFamily: "'Syne',sans-serif",
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <input
          ref={isPassword ? inputRef : undefined}
          className={className}
          style={{
            width: "100%",
            padding: endIcon ? "12px 44px 12px 16px" : "12px 16px",
            borderRadius: 12,
            border: error
              ? "1.5px solid rgba(225,29,72,0.50)"
              : "1.5px solid rgba(2,132,199,0.22)",
            background: "#ffffff",
            color: "#0c1a35",
            fontSize: 14,
            fontFamily: "'DM Sans',sans-serif",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            ...style,
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = "#0284c7";
              e.target.style.boxShadow = "0 0 0 3px rgba(2,132,199,0.14)";
            }
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = "rgba(2,132,199,0.22)";
              e.target.style.boxShadow = "none";
            }
            props.onBlur?.(e);
          }}
          onChange={onChange}
          {...(isPassword
            ? {
                // Password: uncontrolled — value is managed via ref above, never passed as prop
                ...restProps,
                autoComplete: restProps.autoComplete ?? "new-password",
                "data-lpignore": "true",
                "data-form-type": "other",
              }
            : {
                ...restProps,
                value,
              })}
        />
        {endIcon && (
          <div style={{ position: "absolute", right: 14, color: "#4a7fa5" }}>
            {endIcon}
          </div>
        )}
      </div>
      {error && (
        <p
          style={{
            fontSize: 12,
            color: "#e11d48",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            fontSize: 12,
            color: "#4a7fa5",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
};
