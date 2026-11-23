import {
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import styles from './VerificationCodeInput.module.css';

/** Same values as Flutter `AppCodeInputType`. */
export type CodeInputType = 'numeric' | 'alphanumeric';
/** Cell size: 40, 48 or 56 px high. Same values as Flutter `AppFieldSize`. */
export type CodeInputSize = 'small' | 'medium' | 'large';

export interface VerificationCodeInputProps {
  /** Number of boxes. */
  length?: number;
  /** Current code (controlled). */
  value?: string;
  /** Initial code (uncontrolled). */
  defaultValue?: string;
  /** Called on every change with the code typed so far. */
  onChange?: (code: string) => void;
  /** Called once all boxes are filled. */
  onComplete?: (code: string) => void;
  /** numeric shows the number keypad on phones and ignores letters. */
  type?: CodeInputType;
  /** Show dots instead of the characters. */
  mask?: boolean;
  /** Label above the boxes, e.g. "VERIFICATION CODE". */
  label?: ReactNode;
  /** Error message under the boxes. Turns the borders red. */
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  size?: CodeInputSize;
  /** Align the boxes and label: center (as on the verify card) or start. */
  align?: 'center' | 'start';
  /** Accessible name of the group when there's no visible label. */
  'aria-label'?: string;
  className?: string;
}

const patterns: Record<CodeInputType, RegExp> = { numeric: /[0-9]/, alphanumeric: /[0-9a-z]/i };

/**
 * One box per character, as on the "Verify your email" card. Typing moves to the next box,
 * Backspace goes back, arrows move, and pasting a code fills every box.
 */
export function VerificationCodeInput({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  type = 'numeric',
  mask = false,
  label,
  error,
  disabled = false,
  autoFocus = false,
  size = 'medium',
  align = 'center',
  className,
  'aria-label': ariaLabel,
}: VerificationCodeInputProps) {
  const [internal, setInternal] = useState(defaultValue);
  const code = (value ?? internal).slice(0, length);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const labelId = useId();
  const errorId = useId();
  const pattern = patterns[type];

  function commit(next: string) {
    const clean = next.slice(0, length);
    if (value === undefined) setInternal(clean);
    onChange?.(clean);
    if (clean.length === length && !clean.includes(' ')) onComplete?.(clean);
  }

  function focusBox(index: number) {
    const target = inputs.current[Math.max(0, Math.min(length - 1, index))];
    target?.focus();
    target?.select();
  }

  /** Put characters starting at `index`, skipping invalid ones. */
  function insertAt(index: number, text: string) {
    const chars = [...text].filter((char) => pattern.test(char));
    if (!chars.length) return;
    const cells = Array.from({ length }, (_, i) => code[i] ?? ' ');
    chars.forEach((char, offset) => {
      if (index + offset < length) cells[index + offset] = type === 'alphanumeric' ? char.toUpperCase() : char;
    });
    commit(cells.join('').trimEnd());
    focusBox(index + chars.length);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const cells = Array.from({ length }, (_, i) => code[i] ?? ' ');
      if (cells[index] !== ' ') {
        cells[index] = ' ';
        commit(cells.join('').trimEnd());
      } else if (index > 0) {
        cells[index - 1] = ' ';
        commit(cells.join('').trimEnd());
        focusBox(index - 1);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusBox(index + 1);
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    insertAt(index, event.clipboardData.getData('text'));
  }

  return (
    <div
      role="group"
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : (ariaLabel ?? 'Verification code')}
      aria-describedby={error ? errorId : undefined}
      className={[styles.root, styles[align], className].filter(Boolean).join(' ')}
    >
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}
      <div className={styles.boxes}>
        {Array.from({ length }, (_, index) => {
          const char = code[index]?.trim() ?? '';
          return (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              className={[styles.box, styles[size], char && styles.filled, error && styles.invalid].filter(Boolean).join(' ')}
              type={mask ? 'password' : 'text'}
              inputMode={type === 'numeric' ? 'numeric' : 'text'}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              autoCapitalize={type === 'alphanumeric' ? 'characters' : 'off'}
              aria-label={`Character ${index + 1} of ${length}`}
              aria-invalid={error ? true : undefined}
              maxLength={length}
              value={char}
              disabled={disabled}
              autoFocus={autoFocus && index === 0}
              onFocus={(event) => event.target.select()}
              onChange={(event) => {
                const typed = event.target.value;
                if (typed === '') {
                  // Some mobile keyboards delete without a Backspace key event.
                  const cells = Array.from({ length }, (_, i) => code[i] ?? ' ');
                  cells[index] = ' ';
                  commit(cells.join('').trimEnd());
                  return;
                }
                insertAt(index, typed.replace(char, '') || typed);
              }}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
            />
          );
        })}
      </div>
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
