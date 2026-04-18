import styles from './Tag.module.scss';

interface TagProps {
  label: string;
  variant?: 'default' | 'accent';
}

export default function Tag({ label, variant = 'default' }: TagProps) {
  return (
    <span className={`${styles.tag} ${styles[variant]}`}>{label}</span>
  );
}
