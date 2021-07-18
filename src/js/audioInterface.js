// snyth sounds somewhat based on the the following tutorial:
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Simple_synth

import { detect } from '@tonaljs/chord-detect'
import * as Tone from 'tone'
import toastr from 'toastr'

const getNoteFrequency = node => {
  const mapping = {
    'A': 110.00,
    'A#': 116.54,
    'B': 123.47,
    'C': 130.81,
    'C#': 138.59,
    'D': 146.83,
    'D#': 155.56,
    'E': 164.81,
    'F': 174.61,
    'F#': 185.00,
    'G': 196.00,
    'G#': 207.65
  }
  return mapping[node]
}

const getNoteForKey = key => {
  const mapping = {
    'a': 'A',
    'w': 'A#',
    's': 'B',
    'd': 'C',
    'r': 'C#',
    'f': 'D',
    't': 'D#',
    'g': 'E',
    'h': 'F',
    'u': 'F#',
    'j': 'G',
    'i': 'G#'
  }
  return mapping[key]
}

// load drums
const bd = new Tone.Player('/www/static/Bass-Drum-1.wav').toDestination()
const snare = new Tone.Player('/www/static/Ensoniq-ESQ-1-Snare.wav').toDestination()
const hhatClosed = new Tone.Player('/www/static/Closed-Hi-Hat-1.wav').toDestination()
const hhatOpen = new Tone.Player('/www/static/Ensoniq-SQ-1-Open-Hi-Hat.wav').toDestination()
const ft = new Tone.Player('/www/static/Floor-Tom-1.wav').toDestination()

const getDrumForKey = key => {
  const mapping = {
    x: bd,
    z: snare,
    c: ft,
    n: hhatOpen,
    m: hhatClosed
  }
  return mapping[key]
}

const getDrumStringForKey = key => {
  const mapping = {
    x: 'bd',
    z: 'snare',
    c: 'ft',
    n: 'hhatOpen',
    m: 'hhatClosed'
  }
  return mapping[key]
}

const getDrumForMidiId = id => {
  const mapping = {
    36: bd, 
    38: snare,
    43: ft,
    26: hhatOpen,
    22: hhatClosed
  }
  return mapping[id]
}

const getDrumStringForMidiId = id => {
  const mapping = {
    36: 'bd',
    38: 'snare',
    43: 'ft',
    26: 'hhatOpen',
    22: 'hhatClosed'
  }
  return mapping[id]
}

window.stability = 0.8

window.beatHistory = []

window.stabilityWindow = []

setInterval(() => {
  const newBeatHistory = []
  const currentHistoryAggregate = {
    bd: 0,
    snare: 0,
    ft: 0,
    hhatOpen: 0,
    hhatClosed: 0
  }
  const previousHistoryAggregate = {
    bd: 0,
    snare: 0,
    ft: 0,
    hhatOpen: 0,
    hhatClosed: 0
  }
  const now = new Date().getTime()
  beatHistory.forEach(beat => {
    if(now - beat.time < 10000) newBeatHistory.push(beat)
    if(now - beat.time < 3000) {
      currentHistoryAggregate[beat.drum] += 1
    }
    if(now - beat.time < 4000 && now - beat.time > 1500) {
      previousHistoryAggregate[beat.drum] += 1
    } 
  })  
  console.log('Current', currentHistoryAggregate)
  console.log('Previous', previousHistoryAggregate)
  //window.beatHistory = newBeatHistory
  // stability: shared number of beats in both windows divided by total number of beats in current window
  console.log(Object.keys(currentHistoryAggregate))
  let currentNumberOfBeats = 0;
  let sharedNumberOfBeats = 0;
  Object.keys(currentHistoryAggregate).forEach(drum => {
    currentNumberOfBeats += currentHistoryAggregate[drum]
    sharedNumberOfBeats += Math.abs(currentHistoryAggregate[drum] - Math.abs(currentHistoryAggregate[drum] - previousHistoryAggregate[drum]))
  })
  console.log(currentNumberOfBeats, sharedNumberOfBeats)
  const tempStability = currentNumberOfBeats === 0 ? 0.8 : sharedNumberOfBeats / currentNumberOfBeats
  stabilityWindow.push(tempStability)
  if(stabilityWindow.length < 3) {
    stability = 0.8
  } else {
    stability = stabilityWindow.slice(-3).reduce((a, b) => a + b, 0 ) / 3
  }
  console.log('Stability:', stability)
}, 2000)

// maintain array of currently "active" notes
let notes = []

const playTone = (frequency, masterGainNode, audioContext) => {
  const oscillator = audioContext.createOscillator()
  oscillator.connect(masterGainNode)
  oscillator.type = 'square'
  oscillator.frequency.value = frequency
  oscillator.start()
  return oscillator
}

const audioInterface = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  let oscillatorDictionary = {}
  const masterGainNode = audioContext.createGain()
  masterGainNode.connect(audioContext.destination)
  toastr.options.closeDuration = 5000
  window.addEventListener('keydown', event => {
    if(getDrumForKey(event.key)) {
      getDrumForKey(event.key).start()
      beatHistory.push({
        drum: getDrumStringForKey(event.key),
        time: new Date().getTime()
       })
      return
    }
    processSound(event)
  })

  window.addEventListener('keyup', event => {
    const note = getNoteForKey(event.key)
    if (note) {
      if (notes.includes(note)) {
        notes = []
      }
      if (oscillatorDictionary[note]) {
        oscillatorDictionary[note].stop()
      }
    }
  })
}

navigator.requestMIDIAccess()
  .then(function(access) {
     const inputs = access.inputs.values()
     const input = inputs.next().value
     if(input.name === 'TD-17') {
       console.log('here TD')
      input.onmidimessage = message => {
        const drumId = message && message.data && message.data[1]
        console.log(drumId)
        if(drumId && getDrumForMidiId(drumId)) {
          //getDrumForMidiId(drumId).start()
          beatHistory.push({
            drum: getDrumStringForMidiId(drumId),
            time: new Date().getTime()
          })
          return
        }
      }
     }
  })

function processSound(event) {
  const note = getNoteForKey(event.key)
    if (note) {
      notes.push(note)
      const frequency = getNoteFrequency(note)
      console.log(note, frequency)
      const chord = detect(notes)[0] ? detect(notes)[0] : 'none'
      console.log(notes, chord)
      if (chord !== 'none') {
        let currentScript = window.editor.getValue()
        console.log(currentScript)
        console.log(chord[1])
        if (chord[1] === 'M') {
          currentScript = currentScript.replace(
            '(isActive && neighborActivity >= 2 && neighborActivity < 4)',
            '(isActive && neighborActivity >= 1 && neighborActivity < 4)'
          )
          currentScript = currentScript.replace(
            'neighborActivity === 3',
            '(neighborActivity === 0 && Math.random() < 0.5)'
          )
          toastr.info(`Identified chord: ${chord}`)
          window.activeAgentMode = 'major'
        } else if (chord[1] === 'm') {
          currentScript = currentScript.replace(
            '(isActive && neighborActivity >= 1 && neighborActivity < 4)',
            '(isActive && neighborActivity >= 2 && neighborActivity < 4)'
          )
          currentScript = currentScript.replace(
            '(neighborActivity === 0 && Math.random() < 0.5)',
            'neighborActivity === 3'
          )
          toastr.info(`Identified chord: ${chord}`)
          window.activeAgentMode = 'minor'
        }
        setTimeout(() => {
          window.editor.setValue(currentScript)
          const model = window.editor.getModel()
          // This will preserve the undo stack.
          model.pushEditOperations(
              [],
              [{ range: model.getFullModelRange(), text: currentScript }],
              () => null,
          )
        }, 1000)
      }
      if (oscillatorDictionary[note]) {
        oscillatorDictionary[note].stop()
      }
      oscillatorDictionary[note] = playTone(frequency, masterGainNode, audioContext)
    }
}
export default audioInterface
