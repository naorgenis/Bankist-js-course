'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentAccount, timer;

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const move = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  move.forEach(function (mov, i) {
    let type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">   
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div> 
          <div class="movements__date">3 days ago</div> 
          <div class="movements__value">${mov} €</div> 
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcdisaplayBalance = function (movements) {
  const value = movements.reduce((acc, mov) => acc + mov, 0);
  console.log(value);
  labelBalance.textContent = `${value} €`;
};

const max = account1.movements.reduce(function (acc, cur) {
  if (acc < cur) return cur;
  else return acc;
}, account1.movements[0]);

const calcDisplaySummary = function (account) {
  labelSumIn.textContent = `${account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0)}€`;

  labelSumOut.textContent = `${account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0)}€`;

  labelSumInterest.textContent = `${account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, mov) => acc + mov, 0)}€`;
};

const createUserName = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(usr => usr[0])
      .join('');
  });
};
createUserName(accounts);

const startLogOutTimer = function () {
  let time = 1000;
  const tick = function () {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      containerApp.style.opacity = 0;
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
    }
    time--;
  };

  tick();
  timer = setInterval(tick, 1000);
  return timer;
};

const refreshPage = function (acc) {
  calcdisaplayBalance(acc.movements);
  displayMovements(acc);
  calcDisplaySummary(acc);
};

//----------event listener------------
btnLogin.addEventListener('click', function (e) {
  //prevent form from refreshing
  e.preventDefault();
  console.log(accounts);
  console.log(inputLoginUsername.value);
  if (
    (currentAccount = accounts.find(
      account =>
        account.username === inputLoginUsername.value &&
        account.pin === Number(inputLoginPin.value)
    ))
  ) {
    labelWelcome.textContent = `Welcome ${currentAccount.owner}`;
    containerApp.style.opacity = 100;

    inputLoginUsername.value = inputLoginPin.value = '';

    inputLoginPin.blur();
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    refreshPage(currentAccount);
    console.log(currentAccount.movements);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const usrName = inputTransferTo.value;
  const reciverAcc = accounts.find(account => account.username === usrName);

  if (
    amount > 0 &&
    reciverAcc &&
    Number(labelBalance.textContent.split(' ')[0]) >= amount &&
    reciverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(amount * -1);
    reciverAcc.movements.push(amount);
    refreshPage(currentAccount);
  } else console.log('user/amonut prob');
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      refreshPage(currentAccount);
    }, 2500);
  }
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    containerApp.style.opacity = 0;
    accounts.splice(index, 1);
    console.log(accounts);
  }
});
let sort = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !sort);
  sort = !sort;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// currentAccount = account1;
// containerApp.style.opacity = 100;
// refreshPage(account1);

const now = new Date();
console.log(now);

const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();
const hour = now.getHours();
const min = now.getMinutes();

labelDate.textContent = `${day}/${month}/${year} ${hour}:${min}`;
