document.getElementById('image-input').addEventListener('change', handleImage);
document.getElementById('add-text-btn').addEventListener('click', handleAddText);
document.getElementById('download-btn').addEventListener('click', handleDownload);

const imageEditor = document.getElementById('editor-container');
const image = document.querySelector('.image');

function handleImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageUrl = e.target.result;
      image.src = imageUrl;
      imageEditor.style.width = "70%";
      //imageEditor.style.height = "450px"; 
      document.querySelector('.text-container').style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

function handleAddText() {
  let text = document.getElementById('text-input').value;
  if (text !== '') {
    addText(text);
    document.getElementById('text-input').value = '';
  }
}

function addText(text) {
  const textElement = document.createElement('div');
  textElement.classList.add('editable-text');
  textElement.textContent = text;
  textElement.contentEditable = true;

  const textControls = createTextControls(textElement);
  imageEditor.appendChild(textControls);
  textElement.addEventListener('focus', () => {
    textControls.style.display = 'flex';
  });

  document.addEventListener('click', (e) => {
    const withinBoundaries = e.composedPath().includes(textControls);
    const withinBoundaries2 = e.composedPath().includes(textElement);
    if (!withinBoundaries && !withinBoundaries2) {
      textControls.style.display = 'none';
    }
  })

  textElement.addEventListener('mousedown', handleTextMouseDown);
  textElement.addEventListener('dragstart', (event) => event.preventDefault()); // Запрет на драг-эффект при перетаскивании
  imageEditor.appendChild(textElement);


  function handleTextMouseDown(event) {
    let shiftX = event.clientX - textElement.getBoundingClientRect().left;
    let shiftY = event.clientY - textElement.getBoundingClientRect().top;

    // переносит на координаты (pageX, pageY),
    // дополнительно учитывая изначальный сдвиг относительно указателя мыши
    function moveAt(pageX, pageY) {
      textElement.style.left = `${pageX - shiftX}px`;
      textElement.style.top = `${pageY - shiftY}px`;
    }

    function onMouseMove(event) {
      let imgX = event.clientX - imageEditor.getBoundingClientRect().left;
      let imgY = event.clientY - imageEditor.getBoundingClientRect().top;

      //проверка на выход за границы
      if ((imgX - shiftX > 0) && (imgY - shiftY > 0) && (imgX - shiftX < imageEditor.clientWidth - textElement.clientWidth) && (imgY < imageEditor.clientHeight - textElement.clientHeight)) {
        moveAt(imgX, imgY);
      }
    }

    // передвигаем при событии mousemove
    document.addEventListener('mousemove', onMouseMove);

    // отпустить, удалить ненужные обработчики
    textElement.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', onMouseMove);
      textElement.onmouseup = null;
    });
  };
}

function createTextControls(textElement) {
  const textControls = document.createElement('div');
  textControls.classList.add('text-controls');

  const fontSizeInput = document.createElement('input');
  fontSizeInput.type = 'range';
  fontSizeInput.min = '10';
  fontSizeInput.max = '100';
  fontSizeInput.step = '1';
  fontSizeInput.value = '20';
  fontSizeInput.addEventListener('input', () => {
    textElement.style.fontSize = `${fontSizeInput.value}px`;
  });

  const boldButton = document.createElement('div');
  boldButton.classList.add('bold-button');
  boldButton.textContent = 'Bold';
  boldButton.addEventListener('click', () => {
    if (textElement.style.fontWeight === 'bold') {
      textElement.style.fontWeight = 'normal'
      boldButton.style.fontWeight = 'normal';
      boldButton.style.backgroundColor = '#e9e9e9';
    } else  {
      textElement.style.fontWeight = 'bold';
      boldButton.style.fontWeight = 'bold';
      boldButton.style.backgroundColor = '#fff';
  }
  });

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = '#000000';
  colorInput.addEventListener('input', () => {
    textElement.style.color = colorInput.value;
  });

  textControls.appendChild(fontSizeInput);
  textControls.appendChild(boldButton);
  textControls.appendChild(colorInput);

  return textControls;
}

function handleDownload() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = image.offsetWidth;
  canvas.height = image.offsetHeight;

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const textElements = document.querySelectorAll('.editable-text');
  textElements.forEach((textElement) => {
    const style = getComputedStyle(textElement);
    const left = textElement.offsetLeft;
    const top = textElement.offsetTop;

    ctx.font = style.font;
    ctx.fontSize = style.fontSize;
    ctx.fontWeight = style.fontWeight;
    ctx.fillStyle = style.color;
    ctx.textBaseline = "top";
    ctx.fillText(textElement.textContent, left, top);
  });

  const dataURL = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'meme.png';
  a.click();
}