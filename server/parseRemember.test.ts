import { parseRemember } from './parseRemember.js'

/**
 * Minimal assertion helper for local runs without a full test runner.
 */
function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

const sample = `Here is what I have.
[[remember:facts]] User deadline is July 13. [[/remember]]
[[remember:beliefs]] User likely cares about craft. [[/remember]]
[[remember:questions]] Which metric matters most to judges. [[/remember]]
Facts override beliefs.`

const { cleaned, memories } = parseRemember(sample)

assert(!cleaned.includes('[[remember'), 'tags must be stripped')
assert(memories.length === 3, 'expected three memories')
assert(memories[0].namespace === 'facts', 'first memory is facts')
assert(memories[1].namespace === 'beliefs', 'second memory is beliefs')
assert(memories[2].namespace === 'questions', 'third memory is questions')
assert(
  memories[0].text === 'User deadline is July 13.',
  'fact text must be trimmed',
)
assert(cleaned.includes('Here is what I have.'), 'visible text retained')

// eslint-disable-next-line no-console
console.log('parseRemember tests passed')
