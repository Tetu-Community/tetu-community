import cache from 'memory-cache'

export async function getOrSetCache(key: string, fetchFn: any, timeout: any): Promise<any> {
  const cachedValue = cache.get(key)
  if (cachedValue) return cachedValue
  const res = await fetchFn()
  cache.put(key, res, timeout)
  return res
}
