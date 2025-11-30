// Dependency Inversion (DIP): Benchmark generation and presentation logic
// is extracted out of any specific component into this small utility module.
// Components now depend on this abstraction (`getBenchmarkMs` and `benchmarkClass`)
// instead of creating random values and color logic inline. This makes the
// behavior easier to test and replace (e.g., provide a mocked implementation
// during unit tests) — fulfilling DIP by depending on higher-level abstractions.
export function getBenchmarkMs(min = 120, max = 500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function benchmarkClass(ms: number) {
  if (ms <= 200) return 'bg-green-600 text-white';
  if (ms <= 350) return 'bg-amber-500 text-white';
  return 'bg-red-600 text-white';
}
