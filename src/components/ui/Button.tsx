import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonBaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined
  }

type ButtonAsLink = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-rpiGold text-rpiNavy hover:bg-rpiGold/90 focus-visible:ring-rpiGold',
  secondary:
    'border-2 border-rpiNavy text-rpiNavy hover:bg-rpiNavy hover:text-white focus-visible:ring-rpiNavy',
  ghost:
    'text-rpiNavy hover:bg-rpiNavy/10 focus-visible:ring-rpiNavy',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className } = props

  const classes = clsx(
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variantStyles[variant],
    sizeStyles[size],
    className
  )

  if ('href' in props && props.href !== undefined) {
    const {
      variant: _v,
      size: _s,
      className: _c,
      href,
      ...anchorProps
    } = props as ButtonAsLink
    return <a href={href} className={classes} {...anchorProps} />
  }

  const {
    variant: _v,
    size: _s,
    className: _c,
    href: _h,
    ...buttonProps
  } = props as ButtonAsButton
  return <button type="button" className={classes} {...buttonProps} />
}
