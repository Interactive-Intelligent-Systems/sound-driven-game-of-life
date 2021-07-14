import $$ from 'dom7'
import Framework7 from 'framework7/framework7.esm.bundle.js'
import 'framework7/css/framework7.bundle.css'
import * as monaco from 'monaco-editor'
import Swal from 'sweetalert2'
// import js-son and assign Belief, Plan, Agent, and Environment to separate consts
import { Plan } from 'js-son-agent'
// Icons and App Custom Styles
import '../css/icons.css'
import '../css/app.css'
// Import Routes
import routes from './routes.js'
// Game of Life
import { GameOfLife, determineNeighborActivity } from './GameOfLife'
// Audio interface
import audioInterface from './audioInterface'

window.Plan = Plan
window.determineNeighborActivity = determineNeighborActivity

document.addEventListener('copy', event => {
  event.clipboardData.setData('text/plain', JSON.stringify(window.gameOfLife.state))
  event.preventDefault()
})

document.addEventListener('paste', event => {
  let state
  try {
    state = JSON.parse(event.clipboardData.getData('text/plain'))
  } catch (_) { console.log(`eval error on paste: ${_}`) }
  window.gameOfLife.state = state
  event.preventDefault()
})

var app = new Framework7({ // eslint-disable-line no-unused-vars
  root: '#app', // App root element

  name: 'JS-son: Game of Life', // App name
  theme: 'auto', // Automatic theme detection
  // App root data
  data: () => {
    $$(document).on('page:init', e => {
      $$('.get-started').on('click', () => {
        Swal.fire({
          title: '<strong>Sound-Driven Game of Life</strong>',
          icon: 'info',
          html:
            `In this installation, you can interact with the <em>Game of Life</em> simulation that runs on this page.
             By playing the drums, you affect how the <em>agents</em> (rectangles) in the simulation behave.
             The more steadily you keep a solid beat, the more steady the simulation will behave.
             By changing the dynamics of your play, you can drastically change the state of the simulation.
             When you switch from steady to dynamic playing and back, you will see that intriguing patterns will emerge.
            `,
          showCloseButton: true,
          showCancelButton: false,
          focusConfirm: false,
          confirmButtonText:
            'Got it!',
        })
      })
      window.editor = monaco.editor.create(document.getElementById('editor'), {
        value: [
          `
[
  Plan(
    beliefs => {
      const neighborActivity = determineNeighborActivity(beliefs.index, beliefs.activityArray)
      const isActive = beliefs.activityArray[beliefs.index]
      return ((isActive && neighborActivity >= 2 && neighborActivity < 4) ||
        neighborActivity === 3) && !(Math.random() < 0.1 && stability < 0.7) || (Math.random() < 0.2 && stability > 0.85)
    },
    () => ({ nextRound: 'active' })
  )
]
          `
        ].join('\n'),
        language: 'javascript'
      })
      window.gameOfLife = GameOfLife()
      window.editor.onDidChangeModelContent(() => {
        const tPlans = window.editor.getValue()
        let evalSuccess = false
        try {
          const plans = eval(tPlans)
          plans.forEach(plan => plan.run(window.gameOfLife.agents[0].beliefs))
          evalSuccess = true
        } catch (_) { console.log(`eval error: ${_}`) }
        if (evalSuccess) {
          Object.keys(window.gameOfLife.agents).forEach(key => { window.gameOfLife.agents[key].plans = eval(tPlans) })
        }
      })
      let shouldRestart = false
      $$('.restart-button').on('click', () => {
        shouldRestart = true
      })
      window.setInterval(() => {
        if (shouldRestart) {
          location = location
        } else {
          window.gameOfLife.run(1)
        }
      }, 500)
    })
    audioInterface()
  },
  // App routes
  routes: routes
})
