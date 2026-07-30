// Conteúdo em Português — jogo simples de arrastar e soltar
const wordsList = [
  'treinamento',
  'dados',
  'inferência',
  'algoritmo',
  'modelo'
];

const wordsContainer = document.getElementById('words');
const dropzones = Array.from(document.querySelectorAll('.dropzone'));
const checkBtn = document.getElementById('check');
const resetBtn = document.getElementById('reset');
const resultEl = document.getElementById('result');

let dragged = null;

function shuffle(array){
  for(let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function renderWords(){
  wordsContainer.innerHTML = '';
  const pool = [...wordsList];
  shuffle(pool);
  pool.forEach(word => {
    const span = document.createElement('button');
    span.className = 'word';
    span.type = 'button';
    span.draggable = true;
    span.textContent = word;
    span.dataset.word = word;

    span.addEventListener('dragstart', e => {
      dragged = span;
      e.dataTransfer.setData('text/plain', word);
      setTimeout(() => span.classList.add('dragging'), 0);
    });
    span.addEventListener('dragend', () => {
      dragged = null;
      span.classList.remove('dragging');
    });

    // Permite escolha por teclado: Enter/Space coloca na primeira zona vazia
    span.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        const target = dropzones.find(d => !d.dataset.filled);
        if(target){
          placeWordInDropzone(span.dataset.word, target);
        }
      }
    });

    wordsContainer.appendChild(span);
  });
}

function placeWordInDropzone(word, dropzone){
  // Se a dropzone já tem uma palavra, retorna-a ao pool
  if(dropzone.dataset.filled){
    addWordToPool(dropzone.dataset.filled);
    dropzone.textContent = '';
    delete dropzone.dataset.filled;
    dropzone.classList.remove('filled','correct','wrong');
  }

  // Remove o mesmo word de outra dropzone (se estiver em outra)
  const other = dropzones.find(d => d !== dropzone && d.dataset.filled === word);
  if(other){
    other.textContent = '';
    delete other.dataset.filled;
    other.classList.remove('filled','correct','wrong');
  }

  // Remove o botão do pool (se existir)
  const btn = Array.from(wordsContainer.children).find(b => b.dataset.word === word);
  if(btn){
    btn.remove();
  }

  // Coloca a palavra na dropzone
  dropzone.textContent = word;
  dropzone.dataset.filled = word;
  dropzone.classList.add('filled');
}

function setupDropzones(){
  dropzones.forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('hover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('hover'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('hover');
      const word = e.dataTransfer.getData('text/plain');
      if(word) placeWordInDropzone(word, zone);
    });

    // Clique em uma dropzone preenchida: retorna a palavra ao pool
    zone.addEventListener('click', () => {
      if(zone.dataset.filled){
        const word = zone.dataset.filled;
        addWordToPool(word);
        zone.textContent = '';
        delete zone.dataset.filled;
        zone.classList.remove('filled','correct','wrong');
      }
    });

    // Acessibilidade teclado: Delete/Backspace remove palavra da zona
    zone.addEventListener('keydown', e => {
      if((e.key === 'Delete' || e.key === 'Backspace') && zone.dataset.filled){
        const word = zone.dataset.filled;
        addWordToPool(word);
        zone.textContent = '';
        delete zone.dataset.filled;
        zone.classList.remove('filled','correct','wrong');
      }
      // Enter/Space quando vazia foca no primeiro item do pool (para mobile/teclado)
      if((e.key === 'Enter' || e.key === ' ') && !zone.dataset.filled){
        e.preventDefault();
        const firstWordBtn = wordsContainer.querySelector('.word');
        if(firstWordBtn){
          placeWordInDropzone(firstWordBtn.dataset.word, zone);
        }
      }
    });

    // Permitir foco
    zone.tabIndex = 0;
  });
}

function addWordToPool(word){
  // Evita duplicatas no pool
  if(Array.from(wordsContainer.children).some(b => b.dataset.word === word)) return;
  const span = document.createElement('button');
  span.className = 'word';
  span.type = 'button';
  span.draggable = true;
  span.textContent = word;
  span.dataset.word = word;

  span.addEventListener('dragstart', e => {
    dragged = span;
    e.dataTransfer.setData('text/plain', word);
    setTimeout(() => span.classList.add('dragging'), 0);
  });
  span.addEventListener('dragend', () => {
    dragged = null;
    span.classList.remove('dragging');
  });

  span.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      const target = dropzones.find(d => !d.dataset.filled);
      if(target){
        placeWordInDropzone(span.dataset.word, target);
      }
    }
  });

  wordsContainer.appendChild(span);
}

checkBtn.addEventListener('click', () => {
  let correct = 0;
  dropzones.forEach(zone => {
    zone.classList.remove('correct','wrong');
    const expected = zone.dataset.answer;
    const given = zone.dataset.filled || '';
    if(given === expected){
      zone.classList.add('correct');
      correct++;
    } else if(given){
      zone.classList.add('wrong');
    }
  });
  if(correct === dropzones.length){
    resultEl.textContent = 'Parabéns — todas corretas! 🎉';
    resultEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--success') || '#10b981';
  } else {
    resultEl.textContent = `${correct} de ${dropzones.length} corretas. Tente novamente.`;
    resultEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--muted') || '#94a3b8';
  }
});

resetBtn.addEventListener('click', () => {
  dropzones.forEach(z => {
    z.textContent = '';
    delete z.dataset.filled;
    z.classList.remove('filled','correct','wrong','hover');
  });
  resultEl.textContent = '';
  renderWords();
});

// Inicialização
renderWords();
setupDropzones();