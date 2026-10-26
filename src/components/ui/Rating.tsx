// ============================================
// paint_n_meraki — RATING COMPONENT
// ============================================

import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export default function Rating({ value, max = 5, size = 'md', showValue = false }: RatingProps) {
  const sizeMap = { sm: 12, md: 16, lg: 20 };
  const iconSize = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(value);
        const halfFilled = !filled && i < value;
        return (
          <Star
            key={i}
            size={iconSize}
            className={
              filled
                ? 'star-filled fill-current'
                : halfFilled
                  ? 'text-gold fill-gold/50'
                  : 'star-empty'
            }
          />
        );
      })}
      {showValue && (
        <span className={`ml-1 font-medium text-charcoal ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          {value}
        </span>
      )}
    </div>
  );
}
