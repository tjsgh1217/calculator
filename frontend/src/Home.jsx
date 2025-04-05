import React, { useState, useEffect, useRef } from 'react';
import { calculationApi } from './api';
import * as math from 'mathjs';
import './Home.css';

const Calculator = ({ isLoggedIn }) => {
  const [currentInput, setCurrentInput] = useState('');
  const [, setOperator] = useState('');
  const [previousInput, setPreviousInput] = useState('');
  const [expression, setExpression] = useState('');
  const [displayExpression, setDisplayExpression] = useState('');
  const displayRef = useRef(null);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [displayExpression]);

  const updateDisplay = (value) => {
    setDisplayExpression(value);
  };

  const appendNumber = (number) => {
    if (currentInput.length < 16) {
      const newCurrentInput = currentInput + number;
      setCurrentInput(newCurrentInput);
      const newDisplayExpression = displayExpression + number;
      setDisplayExpression(newDisplayExpression);
    }
  };

  const appendOperator = (op) => {
    if (currentInput === '' && previousInput === '') return;

    let newExpression = expression;
    if (currentInput !== '') {
      setPreviousInput(currentInput);
      newExpression += currentInput;
    }

    setOperator(op);
    newExpression += ' ' + op + ' ';
    setExpression(newExpression);
    updateDisplay(newExpression);
    setCurrentInput('');
  };

  const clearDisplay = () => {
    setCurrentInput('');
    setPreviousInput('');
    setOperator('');
    setExpression('');
    setDisplayExpression('');
  };

  const calculateResult = () => {
    if (currentInput === '' && previousInput === '') return;

    let newExpression = expression;
    if (currentInput !== '') {
      newExpression += currentInput;
    }

    try {
      const fullExpression = newExpression;

      const result = math.evaluate(newExpression);

      setPreviousInput(result.toString());
      setCurrentInput('');
      setExpression(result.toString());
      updateDisplay(fullExpression + ' = ' + result);

      if (isLoggedIn) {
        saveCalculation(fullExpression, result.toString());
      }
    } catch (error) {
      alert('계산 오류 발생');
      return;
    }
  };

  const saveCalculation = async (expression, result) => {
    try {
      const response = await calculationApi.saveCalculation(expression, result);
      if (response.success) {
        console.log('계산 기록이 저장되었습니다.');
      } else {
        console.error('계산 기록 저장 실패:', response.message);
      }
    } catch (error) {
      console.error('계산 기록 저장 중 오류:', error);
    }
  };

  const deleteLastChar = () => {
    if (currentInput !== '') {
      const newCurrentInput = currentInput.slice(0, -1);
      setCurrentInput(newCurrentInput);
      const newDisplayExpression = displayExpression.slice(0, -1);
      setDisplayExpression(newDisplayExpression);
    } else if (displayExpression !== '') {
      let newDisplayExpression = displayExpression;

      if (newDisplayExpression.slice(-1) === ' ') {
        newDisplayExpression = newDisplayExpression.slice(0, -3);
      } else if (newDisplayExpression.includes(' = ')) {
        newDisplayExpression = newDisplayExpression.split(' = ')[0];
      } else {
        newDisplayExpression = newDisplayExpression.slice(0, -1);
      }

      setDisplayExpression(newDisplayExpression);
      setExpression(newDisplayExpression);
    }
  };

  return (
    <div id="calculator">
      <h2>Calculator</h2>
      <input
        type="text"
        id="display"
        ref={displayRef}
        value={displayExpression}
        disabled
      />
      <div>
        <button onClick={() => appendNumber('1')}>1</button>
        <button onClick={() => appendNumber('2')}>2</button>
        <button onClick={() => appendNumber('3')}>3</button>
        <button onClick={() => appendOperator('+')}>+</button>
      </div>
      <div>
        <button onClick={() => appendNumber('4')}>4</button>
        <button onClick={() => appendNumber('5')}>5</button>
        <button onClick={() => appendNumber('6')}>6</button>
        <button onClick={() => appendOperator('-')}>-</button>
      </div>
      <div>
        <button onClick={() => appendNumber('7')}>7</button>
        <button onClick={() => appendNumber('8')}>8</button>
        <button onClick={() => appendNumber('9')}>9</button>
        <button onClick={() => appendOperator('*')}>*</button>
      </div>
      <div>
        <button onClick={() => appendNumber('0')}>0</button>
        <button onClick={clearDisplay}>C</button>
        <button onClick={calculateResult}>=</button>
        <button onClick={() => appendOperator('/')}>/</button>
      </div>
      <div>
        <button onClick={deleteLastChar} className="delete-btn">
          DEL
        </button>
      </div>
    </div>
  );
};

export default Calculator;
