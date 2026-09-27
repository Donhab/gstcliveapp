import React from 'react';
import badgeImage from '../assets/images/gstc_garki_badge_1790464142597.jpg';

interface SchoolBadgeProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
}

export const SchoolBadge: React.FC<SchoolBadgeProps> = ({
  className = '',
  size = 'md',
  showBorder = true
}) => {
  let sizeClass = 'w-10 h-10';
  if (size === 'xs') sizeClass = 'w-7 h-7';
  if (size === 'sm') sizeClass = 'w-9 h-9';
  if (size === 'md') sizeClass = 'w-11 h-11';
  if (size === 'lg') sizeClass = 'w-16 h-16';
  if (size === 'xl') sizeClass = 'w-24 h-24';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-white overflow-hidden shadow-xs ${
        showBorder ? 'border-2 border-amber-300 ring-1 ring-emerald-800/30' : ''
      } ${sizeClass} ${className}`}
      title="Govt. Science & Technical College Garki, Abuja - Official School Badge"
    >
      <img
        src={badgeImage}
        alt="GSTC Garki School Badge"
        className="w-full h-full object-cover object-center transform scale-105"
      />
    </div>
  );
};
