const store = {
  rovers: undefined,
  roverImages: undefined,
  roverImageIndex: 0,
  previousRover: undefined,
  port: 3001,
  selectedRover: undefined
}

const root = document.getElementById('root')

const updateStore = (store, newState) => {
  store = Object.assign(store, newState)
  render(root, store)
}

const render = async (root, state) => {
  root.innerHTML = await App(state)
}

const App = async (state) => {
  return `
        ${Header(state)}
        ${await RoverImage(state)}
        ${RoverData(state)}
        <footer>Bence László - ${new Date().getFullYear()}</footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', async () => {
  await getRovers(store)
  const selectedRover = store.rovers.find(rover => rover.name === 'Curiosity')
  updateStore(store, { selectedRover })
  const previousRover = selectedRover
  updateStore(store, { previousRover })
  await getRoverImage(store)
  await render(root, store)
})

// ------------------------------------------------------  COMPONENTS

const Header = (state) => {
  return `
      <header>
          <h1 id="header-title">Mars Dashboard</h1>
          <div id="header-buttons">
            <button class="tablink" onclick="selectRover('curiosity')">Curiosity</button>
            <button class="tablink" onclick="selectRover('opportunity')">Opportunity</button>
            <button class="tablink" onclick="selectRover('spirit')">Spirit</button>
          </div>
      </header>
      `
}

const RoverData = (state) => {
  if (!state.selectedRover) {
    return ''
  }

  return `
    <div id="databoard">
      <div class="databoard-left">Launching Date:</div><div></div><div class="databoard-right">${state.selectedRover.landingDate}</div>
      <div class="databoard-left">Launch Date:</div><div></div><div class="databoard-right">${state.selectedRover.launchDate}</div>
      <div class="databoard-left">Name:</div><div></div><div class="databoard-right">${state.selectedRover.name}</div>
      <div class="databoard-left">Status:</div><div></div><div class="databoard-right">${state.selectedRover.status}</div>
      <div class="databoard-left">Most Recent Photos:</div><div></div><div class="databoard-right">${state.selectedRover.maxDate}</div>
    </div>
  `
}

const RoverImage = async (state) => {
  const { roverImages, selectedRover } = state
  let { roverImageIndex, previousRover } = state

  if (!selectedRover) {
    return ''
  }

  if (!roverImages || selectedRover !== previousRover) {
    await getRoverImage(state)
    previousRover = selectedRover
    updateStore(store, { previousRover })
    roverImageIndex = 0
    updateStore(store, { roverImageIndex })
  }

  if (roverImages && roverImages[roverImageIndex]) {
    return `
      <div class="wrapper">
        <div class="active-button" id="left" onclick="swipeLeft(store)"></div>
        <div id="image" style="background-image: url('${roverImages[roverImageIndex].img_src}'); background-repeat: no-repeat; backgroud-clip: content-box; background-position: center center; background-size: cover;" ></div>
        <div class="active-button" id="right" onclick="swipeRight(store)"></div>
      </div>`
  } else {
    return `
      <div class="wrapper">
        <p>Please, select a Mars rover to see its photos.</p>
      </div>`
  }
}

const selectRover = (roverName) => {
  if (roverName === store.previousRover) {
    return
  }

  updateStore(store, { roverName })
  const selectedRover = store.rovers.find(rover => rover.name.toLowerCase() === store.roverName)
  updateStore(store, { selectedRover })
  const roverImageIndex = 0
  updateStore(store, { roverImageIndex })
}

const swipeLeft = (state) => {
  let { roverImageIndex } = state

  if (roverImageIndex > 0) {
    roverImageIndex--
    updateStore(store, { roverImageIndex })
  }
}

const swipeRight = (state) => {
  let { roverImages, roverImageIndex } = state

  if (roverImageIndex < roverImages.length - 1) {
    roverImageIndex++
    updateStore(store, { roverImageIndex })
  }
}

// ------------------------------------------------------  API CALLS

const getRoverImage = async (state) => {
  let { roverImages, selectedRover } = state
  const maxDate = selectedRover.maxDate

  if (maxDate && maxDate !== 'undefined') {
    const roverImageData = await fetch(`http://localhost:${state.port}/rover/${selectedRover.name}?maxDate=${maxDate}`)
    roverImages = await roverImageData.json()
    updateStore(store, { roverImages })
  }
}

const getRovers = async (store) => {
  let { rovers } = store

  const roverData = await fetch(`http://localhost:${store.port}/rovers`)
  rovers = await roverData.json()
  updateStore(store, { rovers })
}
