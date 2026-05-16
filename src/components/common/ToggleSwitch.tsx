import React from 'react';

type ToggleTone = 'primary' | 'secondary';
type ToggleSize = 'md' | 'lg';

interface ToggleSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  tone?: ToggleTone;
  size?: ToggleSize;
}

const TONE_CLASSES: Record<ToggleTone, string> = {
  primary: 'peer-checked:bg-primary',
  secondary: 'peer-checked:bg-secondary',
};

const SIZE_CLASSES: Record<ToggleSize, { track: string; knob: string; translate: string }> = {
  md: {
    track: 'h-6 w-11',
    knob: 'h-5 w-5',
    translate: 'peer-checked:translate-x-5',
  },
  lg: {
    track: 'h-8 w-14',
    knob: 'h-7 w-7',
    translate: 'peer-checked:translate-x-6',
  },
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  tone = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <span className={`relative inline-flex cursor-pointer items-center ${className}`.trim()}>
      <input {...props} type="checkbox" className="peer sr-only" />
      <span
        className={`block rounded-full bg-base-content/15 transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${sizeClasses.track} ${TONE_CLASSES[tone]}`}
        aria-hidden="true"
      />
      <span
        className={`pointer-events-none absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md transition-transform duration-200 ${sizeClasses.knob} ${sizeClasses.translate}`}
        aria-hidden="true"
      />
    </span>
  );
};

export default ToggleSwitch;
