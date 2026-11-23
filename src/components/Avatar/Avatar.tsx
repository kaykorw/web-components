import { useState, type HTMLAttributes, type ReactNode } from 'react';

import styles from './Avatar.module.css';
import { getInitials } from './initials';

/** Same values as Flutter `AppAvatarSize`: 24, 28, 36, 48 px. */
export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarShape = 'circle' | 'square';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Person or account name. Used for the initials and the accessible name. */
  name: string;
  /** Photo URL. Falls back to initials if it fails to load. */
  src?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
}

export function Avatar({ name, src, size = 'medium', shape = 'circle', className, ...rest }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <span
      role="img"
      aria-label={name}
      {...rest}
      className={[styles.avatar, styles[size], styles[shape], className].filter(Boolean).join(' ')}
    >
      {showImage ? (
        <img className={styles.image} src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}

export interface AvatarLabelProps extends HTMLAttributes<HTMLDivElement> {
  /** Main line, e.g. an account name. Also used for the avatar initials. */
  title: string;
  /** Second line, e.g. the account type ("INDIVIDUAL"). */
  description?: ReactNode;
  /** Extra content under the text, e.g. a "Parent" badge. */
  extra?: ReactNode;
  /** Photo URL for the avatar. */
  src?: string;
  avatarSize?: AvatarSize;
  /** Hide the avatar and show only the text. */
  hideAvatar?: boolean;
}

/** Avatar with a title and description, as in the Name column of the Accounts table. */
export function AvatarLabel({
  title,
  description,
  extra,
  src,
  avatarSize = 'medium',
  hideAvatar = false,
  className,
  ...rest
}: AvatarLabelProps) {
  return (
    <div {...rest} className={[styles.label, className].filter(Boolean).join(' ')}>
      {!hideAvatar && <Avatar name={title} src={src} size={avatarSize} aria-hidden="true" role={undefined} />}
      <div className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
        {extra && <span className={styles.extra}>{extra}</span>}
      </div>
    </div>
  );
}
