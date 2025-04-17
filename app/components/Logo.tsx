interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-16 h-16" }: LogoProps) {
  return (
    <svg id="svg2" className={className} viewBox="0 0 500 670" xmlns="http://www.w3.org/2000/svg">
      <desc>Source: openclipart.org/detail/209545</desc>
      <defs>
        <pattern x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse" viewBox="0 0 100 100" id="pattern-0">
          <rect x="0" y="0" width="50" height="100" fill="black"/>
        </pattern>
        <pattern id="pattern-0-0" href="#pattern-0" patternTransform="matrix(1, 0, 0, 0.972831, 202.955002, 390.023665)"/>
      </defs>
      <path stroke="rgb(0, 0, 0)" fill="none" paintOrder="fill" strokeWidth="7" d="M 78.289 166.846 L 77.927 557.569 L 401.987 558.543"/>
      <g>
        <path strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="9" stroke="rgb(20, 193, 73)" d="M 79.359 394.557 L 160.913 278.497 L 249.667 392.015 L 372.936 196.943"/>
        <path fill="rgb(21, 236, 0)" stroke="rgb(20, 193, 73)" d="M 334.793 204.884 L 376.114 192.221 L 379.13 234.056"/>
      </g>
      <path fillOpacity="0.32" fillRule="nonzero" fill="url(#pattern-0-0)" stroke="rgb(186, 218, 85)" d="M 353.756 558.752 L 81.08 555.738 L 77.154 401.953 L 159.175 288.82 L 250.697 395.974 L 330.497 272.227 L 349.822 245.616"/>
      <ellipse strokeWidth="5" paintOrder="fill" stroke="rgb(0, 27, 202)" fill="rgb(255, 255, 255)" cx="316.504" cy="465.418" rx="73.675" ry="75.003"/>
      <text fill="rgb(16, 0, 98)" fontFamily="Arial, sans-serif" fontSize="28" transform="matrix(5.135471, 0, 0, 3.251855, -1176.59021, -991.472534)" x="283.104" y="460.686">₹</text>
    </svg>
  );
}
