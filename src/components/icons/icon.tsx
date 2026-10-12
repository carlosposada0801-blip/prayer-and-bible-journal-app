import Svg, { Path } from 'react-native-svg';

import { iconPaths, type IconName } from './paths';

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
};

/** Simple line icon. See `paths.ts` for the full set. */
export function Icon({ name, size = 24, color, strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {iconPaths[name].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

export type { IconName };
