export function getMobileAppVersion(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../../package.json').version as string;
}
