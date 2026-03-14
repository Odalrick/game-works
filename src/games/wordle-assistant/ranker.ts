export function letterFrequencies(
  pool: string[],
): Map<number, Map<string, number>> {
  const frequencies = new Map<number, Map<string, number>>()

  for (const word of pool) {
    for (let position = 0; position < word.length; position++) {
      const letter = word[position]
      if (!frequencies.has(position)) {
        frequencies.set(position, new Map())
      }
      const positionMap = frequencies.get(position)!
      positionMap.set(letter, (positionMap.get(letter) ?? 0) + 1)
    }
  }

  return frequencies
}
