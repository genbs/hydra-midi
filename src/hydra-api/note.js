// @ts-check

import { chainable } from '../utils'
import state from '../state'
import { scale, range, value, adsr, velocity } from '../transforms'
import { getMidiId, resolveNote, resolveInput } from '../midiAccess'

const noteIsPlaying = noteId => state.playingNotes.has(noteId)

export const getNoteId = (note, channel, input) =>
  getMidiId(
    resolveNote(note),
    channel ?? state.defaults.channel,
    resolveInput(input ?? state.defaults.input)
  )

/**
 * returns 1 if the specified note is playing, and 0 otherwise. This is useful
 * if you want to use the value inside a parameter function. See also {@link note}.
 * @example solid(1, 0, () => _note(60) * 0.5).out() // Could also be achieved with solid(1, 0, note(60).value(v => v * 0.5)).out()
 * @param {number|string} note
 * @param {number|string} channel
 * @param {number|string} input
 * @returns
 */
export const _note = (note, channel, input) =>
  noteIsPlaying(getNoteId(note, channel, input)) ? 1 : 0

/**
 * returns the velocity of the specified note in a range from 0 to 1. This is useful
 * if you want to use the value inside a parameter function.
 * @example solid(1, 0, () => _noteVelocity(60) * 0.5).out() // Could also be achieved with solid(1, 0, note(60).velocity().value(v => v * 0.5)).out()
 * @param {number|string} note
 * @param {number|string} channel
 * @param {number|string} input
 * @returns
 */
export const _noteVelocity = (note, channel, input) =>
  velocity(getNoteId(note, channel, input))()()()

/**
 * Create a chainable function that returns 1 if the specified note is playing,
 * and 0 otherwise.
 * @example osc().invert(note(60)).out()
 * @param {number|string} note A note number or a name like 'C3' or '*' to listen
 * to any note.
 * @param {number|string} channel
 * @param {number|string} input
 */
export const note = (note, channel, input) => {
  const noteId = getNoteId(note, channel, input)
  const fn = () => (noteIsPlaying(noteId) ? 1 : 0)
  return chainable(fn, {
    scale,
    range,
    value,
    adsr: adsr(noteId),
    velocity: velocity(noteId),
  })
}
