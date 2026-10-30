export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'pill-tab';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}
