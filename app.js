const expressionDisplay = document.querySelector('#expression');
const resultDisplay = document.querySelector('#result');

let current = '0';
let stored = null;
let operator = null;
let waitingForOperand = false;
let expression = '';
let justCalculated = false;

function render() {
  resultDisplay.textContent = current;
  expressionDisplay.textContent = expression || '\u00a0';
  document.querySelectorAll('[data-operator]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.operator === operator && !waitingForOperand);
  });
}

function format(value) {
  if (!Number.isFinite(value)) return 'Error';
  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function inputDigit(digit) {
  if (current === 'Error' || waitingForOperand || justCalculated) {
    current = digit;
    waitingForOperand = false;
    if (justCalculated) { stored = null; operator = null; expression = ''; }
    justCalculated = false;
  } else if (current === '0') {
    current = digit;
  } else if (current.replace('-', '').replace('.', '').length < 12) {
    current += digit;
  }
  render();
}

function inputDecimal() {
  if (current === 'Error' || waitingForOperand || justCalculated) {
    current = '0.';
    waitingForOperand = false;
    if (justCalculated) { stored = null; operator = null; expression = ''; }
    justCalculated = false;
  } else if (!current.includes('.')) {
    current += '.';
  }
  render();
}

function calculate(left, right, op) {
  switch (op) {
    case '+': return left + right;
    case '−': return left - right;
    case '×': return left * right;
    case '÷': return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function chooseOperator(nextOperator) {
  const inputValue = Number(current);
  if (current === 'Error') return;
  if (operator && !waitingForOperand) {
    const result = calculate(stored, inputValue, operator);
    current = format(result);
    if (current === 'Error') {
      stored = null; operator = null; expression = 'No se puede dividir entre cero';
      render(); return;
    }
    stored = Number(current);
  } else {
    stored = inputValue;
  }
  operator = nextOperator;
  expression = `${current} ${operator}`;
  waitingForOperand = true;
  justCalculated = false;
  render();
}

function equals() {
  if (!operator || waitingForOperand || current === 'Error') return;
  const left = stored;
  const right = Number(current);
  const result = calculate(left, right, operator);
  expression = `${format(left)} ${operator} ${format(right)} =`;
  current = format(result);
  stored = null;
  operator = null;
  waitingForOperand = true;
  justCalculated = true;
  if (current === 'Error') expression = 'No se puede dividir entre cero';
  render();
}

function clear() {
  current = '0'; stored = null; operator = null; waitingForOperand = false;
  expression = ''; justCalculated = false;
  render();
}

function changeSign() {
  if (current !== '0' && current !== 'Error') current = current.startsWith('-') ? current.slice(1) : `-${current}`;
  render();
}

function percent() {
  if (current === 'Error') return;
  current = format(Number(current) / 100);
  render();
}

document.querySelector('.keypad').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.digit !== undefined) inputDigit(button.dataset.digit);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else if (button.dataset.action === 'decimal') inputDecimal();
  else if (button.dataset.action === 'equals') equals();
  else if (button.dataset.action === 'clear') clear();
  else if (button.dataset.action === 'sign') changeSign();
  else if (button.dataset.action === 'percent') percent();
});

document.addEventListener('keydown', (event) => {
  if (/^\d$/.test(event.key)) inputDigit(event.key);
  else if (event.key === '.' || event.key === ',') inputDecimal();
  else if (event.key === '+') chooseOperator('+');
  else if (event.key === '-') chooseOperator('−');
  else if (event.key === '*') chooseOperator('×');
  else if (event.key === '/') { event.preventDefault(); chooseOperator('÷'); }
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); equals(); }
  else if (event.key === 'Escape' || event.key === 'Delete') clear();
  else if (event.key === '%') percent();
  else if (event.key === 'Backspace') {
    if (!waitingForOperand && current !== 'Error') current = current.length > 1 ? current.slice(0, -1) : '0';
    render();
  }
});

render();
