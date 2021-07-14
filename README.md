# A Sound Driven Game of Life
This project contains a sound-driven version of Conway's Game of Life.
The Game of Life runs as a web-based (front end) simulation and a user can interact with it by
playing sounds with their (computer) keyboard. These quality of these sounds will then impact the
rules according to which the Game of Life evolves. In this way, the Game of Life is not only
interact-able, but also interacts with the user: based on the sounds the user plays, the Game of
Life will evolve according to patterns that may or may not be intriguing, and the user can adjust
the sound landscape to facilitate the evolution of more interesting figures.

## Installation Instructions
The project is front end-only JavaScript, compiled with webpack.
Building it requires Node.js.

Install the dependencies:

```
npm install
```

Run the project in development mod:

```
npm run start
```

Build the project to deploy it somewhere:

```
build-prod
```

## Usage Instructions
In this application, you can interact with the *Game of Life* simulation. By playing sounds, you
affect how the *agents*  (rectangles, aka *cells*) in the simulation behave. By changing the
dynamics of your play, you can drastically change the state of the simulation.

### Computer Keyboard Interaction Mode
The computer keyboard interaction mode turns your keyboard into a primitive synthesizer and drum
machine. The following keys are assigned to a sound:

* Synth (*key: tone* mapping); the rules of the simulation change when playing a major chord
  (and then change back when playing a major chord):
    * a: A
    * w: A#
    * s: B
    * d: C
    * r: C#
    * f: D
    * t: D#
    * g: E
    * h: F
    * u: F#
    * j: G
    * i: G#

* Synth (*key: sound* mapping); the continuity of your play (how steadily you keep the beat) affects
  the stability of the simulation. A mostly steady beat with some variance over time keeps the rules
  of the game stable. Lack of stability will make the agents/cells more prone to die. A very steady
  beat will facilitate growth of your agent population:
    * x: bass drum
    * z: snare drum
    * c: floor tom,
    * n: hi-hat (open)
    * m: hi-hat (closed)

### Electronic Drums Interaction Mode
TO BE IMPLEMENTED

## License
[BSD 2-Clause License](./LICENSE)

## Author
[Timotheus Kampik](https://github.com/TimKam/)