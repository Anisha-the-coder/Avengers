const target = document.querySelector('.card');

const effect = document.querySelector('#effect');

const button = document.querySelector('.thanos')


let characters
fetch('https://api.npoint.io/49c83c9f297b3394221b').then(x => x.json()).then(resp => {
  characters = resp
  button.removeAttribute('disabled')
})

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function cardFromCharacter(character) {
  const {
    text,
    image,
    name
  } = character

  return `

    <h2>${name}</h2>
    <div class="char-info">
    ${text.map(t => '<p>'+t+'</p>').join('')}
    </div>
    <img src="${image}">
  
  `;
}

const LAYER_COUNT = 32;
const TRANSITION_DURATION = 1.5;
const TRANSITION_DELAY = 1.35;

let currentLayerCount = LAYER_COUNT;
let currentCharacter = 0
button.addEventListener('click', makeThanos)

async function makeThanos() {
  await Promise.all(
    characters.map(async (character, idx) => {
      await timeout(idx * 3000).then(() => {
        target.innerHTML = cardFromCharacter(character)
        showTarget(target)
        play(LAYER_COUNT, target);
      })
    })
  )
}

function showTarget(target) {
  target.style.opacity = '1'
};

function hideTarget(target) {
  target.style.opacity = '0'
};

function play(layerCount, target) {
  showTarget(target);

  const bRect = target.getBoundingClientRect();
  effect.style.left = `${bRect.left}px`;
  effect.style.top = `${bRect.top}px`;
  effect.style.width = `${bRect.width}px`;
  effect.style.height = `${bRect.height}px`;

  html2canvas(target, {
      backgroundColor: null,
    })
    .then(canvas => {
      const context = canvas.getContext('2d');
      const {
        width,
        height
      } = canvas;

      // get element imageData
      const imgData = context.getImageData(0, 0, width, height);

      // init empty imageData
      const effectImgDatas = [];
      for (let i = 0; i < layerCount; i++) {
        effectImgDatas.push(context.createImageData(width, height));
      }
      sampler(effectImgDatas, imgData, width, height, layerCount);

      // create cloned canvases
      for (let i = 0; i < layerCount; i++) {
        const canvasClone = canvas.cloneNode();
        canvasClone.getContext('2d').putImageData(effectImgDatas[i], 0, 0);


        const transitionDelay = TRANSITION_DELAY * (i / layerCount);
        canvasClone.style.transitionDelay = `${transitionDelay}s`;
        effect.insertAdjacentElement('beforeend', canvasClone);

        delay(0)
          .then(() => {
            const rotate1 = 15 * (Math.random() - .5);
            const rotate2 = 15 * (Math.random() - .5);
            const fac = 2 * Math.PI * (Math.random() - .5);
            const translateX = 60 * Math.cos(fac);
            const translateY = 30 * Math.sin(fac);

            canvasClone.style.transform =
              `rotate(${rotate1}deg) translate(${translateX}px, ${translateY}px) rotate(${rotate2}deg)`;
            canvasClone.style.opacity = 0;

            const removeDelay = 1e3 * (TRANSITION_DURATION + 1 + Math.random());
            delay(removeDelay)
              .then(() => {
                canvasClone.remove();
              });
          });

        hideTarget(target);
      }
    });


}

function sampler(imgDatas, sourceImgData, width, height, layerCount) {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      for (let l = 0; l < 2; l++) {
        // random piece index which tend to grow with x
        const pieceIndex = Math.floor(layerCount * (Math.random() + 2 * x / width) / 3);
        const pixelPos = 4 * (y * width + x);
        for (let rgbaIndex = 0; rgbaIndex < 4; rgbaIndex++) {
          const dataPos = pixelPos + rgbaIndex;
          imgDatas[pieceIndex].data[dataPos] = sourceImgData.data[dataPos];
        }
      }
    }
  }
}

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms);
  })
}