// Calculator State
const calculator = {
    displayValue: '0',
    expression: '',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
    lastAction: null,
    isRadians: true
};

// DOM Elements
const display = document.getElementById('result');
const expressionDisplay = document.getElementById('expression');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

// Initialize Calculator
function initCalculator() {
    updateDisplay();
    setupEventListeners();
    loadThemePreference();
}

// Set up event listeners
function setupEventListeners() {
    // Button clicks
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    // Keyboard support
    document.addEventListener('keydown', handleKeyboardInput);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
}

// Handle button clicks
function handleButtonClick(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const value = button.dataset.value;

    // Add press animation
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 100);

    if (value) {
        inputDigit(value);
    } else if (action) {
        handleAction(action);
    }

    updateDisplay();
}

// Handle keyboard input
function handleKeyboardInput(event) {
    const { key } = event;

    // Prevent default for calculator keys
    if (/[0-9+\-*/.=]|Enter|Backspace|Escape/.test(key)) {
        event.preventDefault();
    }

    // Number keys
    if (/[0-9]/.test(key)) {
        inputDigit(key);
    }
    // Decimal point
    else if (key === '.') {
        inputDecimal();
    }
    // Operators
    else if (['+', '-', '*', '/'].includes(key)) {
        handleOperator(key === '*' ? 'multiply' : 
                      key === '/' ? 'divide' : 
                      key === '+' ? 'add' : 'subtract');
    }
    // Equals
    else if (key === '=' || key === 'Enter') {
        handleAction('equals');
    }
    // Clear
    else if (key === 'Escape' || key === 'c' || key === 'C') {
        handleAction('clear');
    }
    // Backspace
    else if (key === 'Backspace') {
        handleAction('clear-entry');
    }

    updateDisplay();
}

// Input digit
function inputDigit(digit) {
    const { displayValue, waitingForSecondOperand } = calculator;

    if (waitingForSecondOperand) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
    }

    calculator.lastAction = 'digit';
}

// Input decimal
function inputDecimal() {
    if (calculator.waitingForSecondOperand) {
        calculator.displayValue = '0.';
        calculator.waitingForSecondOperand = false;
        return;
    }

    if (!calculator.displayValue.includes('.')) {
        calculator.displayValue += '.';
    }
}

// Handle actions
function handleAction(action) {
    switch (action) {
        case 'clear':
            resetCalculator();
            break;
        case 'clear-entry':
            clearEntry();
            break;
        case 'equals':
            performCalculation();
            break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
            handleOperator(action);
            break;
        case 'percent':
            calculatePercentage();
            break;
        // Scientific functions
        case 'sin':
        case 'cos':
        case 'tan':
            calculateTrigonometric(action);
            break;
        case 'arcsin':
        case 'arccos':
        case 'arctan':
            calculateInverseTrigonometric(action);
            break;
        case 'log':
            calculateLogarithm(10);
            break;
        case 'ln':
            calculateLogarithm(Math.E);
            break;
        case 'exp':
            calculateExponential(Math.E);
            break;
        case 'pow10':
            calculateExponential(10);
            break;
        case 'square':
            calculatePower(2);
            break;
        case 'power':
            handleOperator('power');
            break;
        case 'sqrt':
            calculateRoot(2);
            break;
        case 'cbrt':
            calculateRoot(3);
            break;
        case 'pi':
            inputConstant(Math.PI);
            break;
        case 'e':
            inputConstant(Math.E);
            break;
        case 'factorial':
            calculateFactorial();
            break;
    }

    calculator.lastAction = action;
}

// Handle operators
function handleOperator(nextOperator) {
    const { firstOperand, displayValue, operator } = calculator;
    const inputValue = parseFloat(displayValue);

    if (operator && calculator.waitingForSecondOperand) {
        calculator.operator = nextOperator;
        return;
    }

    if (firstOperand === null && !isNaN(inputValue)) {
        calculator.firstOperand = inputValue;
    } else if (operator) {
        const result = performBasicCalculation(firstOperand, inputValue, operator);
        
        calculator.displayValue = `${parseFloat(result.toPrecision(12))}`;
        calculator.firstOperand = result;
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
}

// Perform basic calculations
function performBasicCalculation(firstOperand, secondOperand, operator) {
    switch (operator) {
        case 'add':
            return firstOperand + secondOperand;
        case 'subtract':
            return firstOperand - secondOperand;
        case 'multiply':
            return firstOperand * secondOperand;
        case 'divide':
            return secondOperand !== 0 ? firstOperand / secondOperand : NaN;
        case 'power':
            return Math.pow(firstOperand, secondOperand);
        default:
            return secondOperand;
    }
}

// Perform final calculation
function performCalculation() {
    const { firstOperand, displayValue, operator } = calculator;
    const inputValue = parseFloat(displayValue);

    if (operator && calculator.waitingForSecondOperand) {
        calculator.displayValue = `${firstOperand}`;
        calculator.expression = `${firstOperand} =`;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
        return;
    }

    if (operator && firstOperand !== null && !isNaN(inputValue)) {
        const result = performBasicCalculation(firstOperand, inputValue, operator);
        
        calculator.displayValue = `${parseFloat(result.toPrecision(12))}`;
        calculator.expression = `${firstOperand} ${getOperatorSymbol(operator)} ${inputValue} =`;
        calculator.firstOperand = result;
        calculator.waitingForSecondOperand = true;
        calculator.operator = null;
    }
}

// Calculate percentage
function calculatePercentage() {
    const currentValue = parseFloat(calculator.displayValue);
    calculator.displayValue = `${currentValue / 100}`;
    calculator.expression = `${currentValue}% =`;
}

// Calculate trigonometric functions
function calculateTrigonometric(func) {
    const value = parseFloat(calculator.displayValue);
    const radians = calculator.isRadians ? value : value * Math.PI / 180;
    let result;

    switch (func) {
        case 'sin':
            result = Math.sin(radians);
            break;
        case 'cos':
            result = Math.cos(radians);
            break;
        case 'tan':
            result = Math.tan(radians);
            break;
    }

    calculator.displayValue = `${parseFloat(result.toPrecision(12))}`;
    calculator.expression = `${func}(${value}) =`;
}

// Calculate inverse trigonometric functions
function calculateInverseTrigonometric(func) {
    const value = parseFloat(calculator.displayValue);
    let result;

    if (value < -1 || value > 1) {
        calculator.displayValue = 'Error';
        calculator.expression = `${func}(${value}) - Domain Error`;
        return;
    }

    switch (func) {
        case 'arcsin':
            result = Math.asin(value);
            break;
        case 'arccos':
            result = Math.acos(value);
            break;
        case 'arctan':
            result = Math.atan(value);
            break;
    }

    // Convert to degrees if not in radians
    if (!calculator.isRadians) {
        result = result * 180 / Math.PI;
    }

    calculator.displayValue = `${parseFloat(result.toPrecision(12))}`;
    calculator.expression = `${func}(${value}) =`;
}

// Calculate logarithm
function calculateLogarithm(base) {
    const value = parseFloat(calculator.displayValue);
    
    if (value <= 0) {
        calculator.displayValue = 'Error';
        calculator.expression = `log${base === Math.E ? 'e' : '10'}(${value}) - Domain Error`;
        return;
    }

    const result = base === Math.E ? Math.log(value) : Math.log10(value);
    calculator.displayValue = `${parseFloat(result.toPrecision(12))}`;
    calculator.expression = `log${base === Math.E ? 'e' : '10'}(${value}) =`;
}

// Calculate exponential
function calculateExponential(base) {
    const value = parseFloat(calculator.displayValue);
    const result = Math.pow(base, value);
    
    calculator.displayValue = `${parseFloat(result.toPrecision(12))}`;
    calculator.expression = `${base === Math.E ? 'e' : '10'}^${value} =`;
}

// Calculate power
function calculatePower(power) {
    const value = parseFloat(calculator.displayValue);
    const result = Math.pow(value, power);
    
    calculator.displayValue = `${parseFloat(result.toPrecision(12))}`;
    calculator.expression = `${value}^${power} =`;
}

// Calculate root
function calculateRoot(root) {
    const value = parseFloat(calculator.displayValue);
    
    if (value < 0 && root % 2 === 0) {
        calculator.displayValue = 'Error';
        calculator.expression = `${root}√${value} - Domain Error`;
        return;
    }

    const result = root === 2 ? Math.sqrt(value) : 
                   root === 3 ? Math.cbrt(value) : 
                   Math.pow(value, 1/root);
    
    calculator.displayValue = `${parseFloat(result.toPrecision(12))}`;
    calculator.expression = `${root}√${value} =`;
}

// Calculate factorial
function calculateFactorial() {
    const value = parseInt(calculator.displayValue);
    
    if (value < 0 || !Number.isInteger(value)) {
        calculator.displayValue = 'Error';
        calculator.expression = `${value}! - Domain Error`;
        return;
    }

    if (value > 170) {
        calculator.displayValue = 'Infinity';
        calculator.expression = `${value}! =`;
        return;
    }

    let result = 1;
    for (let i = 2; i <= value; i++) {
        result *= i;
    }
    
    calculator.displayValue = `${result}`;
    calculator.expression = `${value}! =`;
}

// Input constant
function inputConstant(constant) {
    calculator.displayValue = `${constant}`;
    calculator.expression = constant === Math.PI ? 'π' : 'e';
}

// Reset calculator
function resetCalculator() {
    calculator.displayValue = '0';
    calculator.expression = '';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
}

// Clear entry
function clearEntry() {
    calculator.displayValue = '0';
}

// Update display
function updateDisplay() {
    display.textContent = calculator.displayValue;
    expressionDisplay.textContent = calculator.expression;
}

// Get operator symbol for display
function getOperatorSymbol(operator) {
    const symbols = {
        'add': '+',
        'subtract': '−',
        'multiply': '×',
        'divide': '÷',
        'power': '^'
    };
    return symbols[operator] || operator;
}

// Theme management
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('calculator-theme', isDarkMode ? 'dark' : 'light');
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('calculator-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', initCalculator);