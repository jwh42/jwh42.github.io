let words = [];
let wordInputs = [];
let matches = [];
let inputTemplate = null;

const executeSearch = debounce(executeSearchCore, 500);


class ParsedGuess {

	constructor(tokens, colors) {

		const forbidden = new Set();
		const required = [];

		this.tokens = tokens;
		this.colors = colors;
		this.forbidden = forbidden;
		this.required = required;

		for(let i = 0; i < tokens.length; i++) {

			const token = tokens[i];
			switch(colors[i]) {

			case 'b':
				if(required.indexOf(token) < 0) {
					forbidden.add(token);
				}
				break;

			case 'y':
				required.push(token);
				break;
			}
		}
	}
}


class GuessInput {

	constructor() {

		const rootElement = inputTemplate.cloneNode(true);
		const inputBox = rootElement.querySelector(".input-box");
		inputBox.oninput = () => executeSearch();

		this.colorBoxes = [];
		this.inputBox = inputBox;
		this.rootElement = rootElement;

		for(let i = 0; i < 5; i++) {
			const colorBox = rootElement.querySelector(`.color${i}`);
			colorBox.onclick = this._createColorBoxClickHandler(colorBox, i);
			colorBox.setAttribute("data-color", "b");
			this.colorBoxes.push(colorBox);
		}
	}

	getParsedGuess() {

		const inputValue = this.inputBox.value;
		if(!inputValue || inputValue.length != 5) {
			return null;
		}

		return new ParsedGuess(
			inputValue.toLowerCase(),
			this.colorBoxes.map(i => i.getAttribute("data-color"))
		);
	}

	_createColorBoxClickHandler(colorBox, i) {
		return () => {
			colorBox.setAttribute(
				"data-color",
				this._nextColor(colorBox.getAttribute("data-color"))
			);		
			executeSearch();
		}	
	}

	_nextColor(color) {
		switch(color) {
		case 'y': return 'g';
		case 'g': return 'b';
		default: return 'y';
		}
	}
}


async function init() {

	inputTemplate = document.getElementById("word-input-template").content;

	const wordInputsNode = document.getElementById("word-inputs");
	for(let i = 0; i < 6; i++) {
		const wordInput = new GuessInput();
		wordInputsNode.appendChild(wordInput.rootElement);
		wordInputs.push(wordInput);
	}

	const response = await fetch("words-five.txt");
	const textFile = await response.text();

	words = textFile.split('\n');
	console.log(`loaded ${words.length} words`);
}


function executeSearchCore() {

	const guesses = [];

	for(let i = 0; i < wordInputs.length; i++) {
		const guess = wordInputs[i].getParsedGuess();
		if(guess) {
			guesses.push(guess);
		}
	}

	matches = findMatches(words, guesses);

	let headMessage = `${matches.length.toLocaleString()} match${matches.length === 1? '':'es'}`;

	if(matches.length > 60) {
		headMessage += ". Showing 60:";
	}
	else if(matches.length > 0) {
		headMessage += ":";
	}

	const shuffle = document.getElementById("shuffle");
	shuffle.style.display = matches.length > 60? "block" : "none";

	const resultsHead = document.getElementById("results-head");
	resultsHead.innerText = headMessage;

	populateResultList(matches);
}


function shuffleMatches() {

	let shuffled = [...matches];
	shuffleArray(shuffled, 60);
	sortArray(shuffled, 60);
	populateResultList(shuffled);
}


function shuffleArray(matches, count) {

	for(let i = 0; i < count; i++) {

		let rand = Math.floor(Math.random()*(matches.length - i)) + i;
		let temp = matches[i];
		matches[i] = matches[rand];
		matches[rand] = temp;
	}
}


function sortArray(matches, count) {

	matches.length = count;
	matches.sort();
}


function populateResultList(matches) {

	for(let column = 0; column < 3; column++) {
		const node = document.getElementById(`results-list${column}`);
		node.innerText = matches.slice(column*20, (column+1)*20 - 1).join('\n');
	}
}


function findMatches(words, guesses) {

	const result = [];

	for(let i = 0; i < words.length; i++) {
		if(matchesAllGuesses(words[i], guesses)) {
			result.push(words[i]);
		}
	}

	return result;
}


function matchesAllGuesses(word, guesses) {

	for(let i = 0; i < guesses.length; i++) {
		if(!matchesOneGuess(word, guesses[i])) {
			return false;
		}
	}

	return true;
}


function matchesOneGuess(word, guess) {

	const tokens = guess.tokens;
	const colors = guess.colors;
	const forbidden = guess.forbidden;
	const required = [...guess.required];

	for(let i = 0; i < word.length; i++) {

		const token = word[i];

		if(colors[i] === 'g') {
			if(token !== tokens[i]) {
				return false;
			}
		}
		else {
			if(token === tokens[i] || forbidden.has(token)) {
				return false;
			}
			const index = required.indexOf(token);
			if(index >= 0) {
				required.splice(index, 1);
			}
		}
	}

	return required.length == 0;
}


function debounce(callback, wait) {
	let timeout;
	return (...args) => {
		 const context = this;
		 clearTimeout(timeout);
		 timeout = setTimeout(() => callback.apply(context, args), wait);
	};
}
