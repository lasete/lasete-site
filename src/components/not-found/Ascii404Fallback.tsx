const digits = [
  ['10001', '10001', '10001', '11111', '00001', '00001', '00001'],
  ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
];
const ascii404 = Array.from({ length: 7 }, (_, row) =>
  [0, 1, 0]
    .map((digit) =>
      [...digits[digit][row]]
        .map((pixel) => (pixel === '1' ? '01' : '  '))
        .join(''),
    )
    .join('    '),
).join('\n');
export function Ascii404Fallback() {
  return (
    <pre className="ascii-404-fallback" aria-hidden="true">
      {ascii404}
    </pre>
  );
}
