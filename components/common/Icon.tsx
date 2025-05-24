
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  path: string;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ path, size = 24, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d={path} />
    </svg>
  );
};

export const ThumbsUpIcon: React.FC<Omit<IconProps, 'path'>> = (props) => (
  <Icon path="M7 11v10H4V11h3zm3.586-6.414L12 6.172V16h8V8.414L15.586 4a2 2 0 00-2.828 0L10.586 4.586zM12 2a4 4 0 012.828 1.172L16.243 4.5l1.414-1.414A2 2 0 0120.5 2H22v8h-1.5l-1-4-1 4H18V7.828l-1.414-1.414A2 2 0 0014.172 5L13 6.172V2h-1z" {...props} />
);


export const ChatBubbleIcon: React.FC<Omit<IconProps, 'path'>> = (props) => (
  <Icon path="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" {...props} />
);

export const PlusCircleIcon: React.FC<Omit<IconProps, 'path'>> = (props) => (
  <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" {...props} />
);

export const UserCircleIcon: React.FC<Omit<IconProps, 'path'>> = (props) => (
  <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" {...props} />
);

export const CloseIcon: React.FC<Omit<IconProps, 'path'>> = (props) => (
  <Icon path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" {...props} />
);
    