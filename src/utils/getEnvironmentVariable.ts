export const getEnvironmentVariable = (envVar: string): string => {
  const value: string | undefined = process.env[envVar];
  if(!value) {
    throw new Error(`Environment variable '${envVar}' is empty`)
  }
  return value
}