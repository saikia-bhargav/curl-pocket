// 4px base grid. All layout values must be multiples of 4.
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
} as const;

export const Radius = {
  xs:   4,
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  pill: 999,
} as const;

// Minimum touch target size per platform accessibility guidelines
export const TouchTarget = {
  min: 44,
} as const;
