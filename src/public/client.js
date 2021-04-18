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
  store.selectedRover = store.rovers.find(rover => rover.name === 'Curiosity')
  store.previousRover = store.selectedRover
  await getRoverImage(store)
  await render(root, store)
  await getRoverImage(store)
})

// ------------------------------------------------------  COMPONENTS

const Header = (state) => {
  return `
      <header>
          <h1 id="header-title">Mars Dashboard</h1>
          <button id="tablink1" class="tablink" onclick="selectRover('curiosity')">Curiosity</button>
          <button id="tablink2" class="tablink" onclick="selectRover('opportunity')">Opportunity</button>
          <button id="tablink3" class="tablink" onclick="selectRover('spirit')">Spirit</button>
      </header>
      `
}

const RoverData = (state) => {
  if (!state.selectedRover) {
    return ''
  }

  return `
    <div id="databoard">
      <div class="databoard-left">Launching Date:</div><div></div><div class="databoard-right">${state.selectedRover.landing_date}</div>
      <div class="databoard-left">Launch Date:</div><div></div><div class="databoard-right">${state.selectedRover.launch_date}</div>
      <div class="databoard-left">Name:</div><div></div><div class="databoard-right">${state.selectedRover.name}</div>
      <div class="databoard-left">Status:</div><div></div><div class="databoard-right">${state.selectedRover.status}</div>
    </div>
  `
}

const RoverImage = async (state) => {
  const { roverImages, roverImageIndex, selectedRover, previousRover } = state

  if (!selectedRover) {
    return ''
  }

  if (!roverImages || selectedRover !== previousRover) {
    await getRoverImage(store)
    store.previousRover = selectedRover
    store.roverImagesCurrentIndex = 0
  }

  if (roverImages) {
    return `
      <div class="wrapper">
        <div class="active-button" onclick="swipeLeft(store)">Left</div>
        <div id="image" style="background-image: url('${roverImages[roverImageIndex].img_src}'); background-repeat: no-repeat; backgroud-clip: content-box; background-position: center center; background-size: cover;" ></div>
        <div class="active-button" onclick="swipeRight(store)">Right</div>
      </div>`
  }
}

const selectRover = (roverName) => {
  if (roverName === store.previousRover) {
    return
  }

  updateStore(store, { roverName })

  setTimeout(() => {
    const selectedRover = store.rovers.find(rover => rover.name.toLowerCase() === store.roverName)
    updateStore(store, { selectedRover })
  }, 0)
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
  const maxDate = selectedRover.max_date

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
