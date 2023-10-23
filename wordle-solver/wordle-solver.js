let words = [];

async function init() {

	const response = await fetch("words-five.txt");
	const textFile = await response.text();

	words = textFile.split('\n');
	console.log(`loaded ${words.length} words`);

	const searches = [
		{
			tokens: 'stars',
			colors: 'bybbb'
		},
		{
			tokens: 'potty',
			colors: 'yyybb'
		},
		{
			tokens: 'guilt',
			colors: 'bbbby'
		}
	];

	prepareSearches(searches);

	const matches = findMatches(words, searches);

	console.log(`found ${matches.length} matches`);
	for(let i = 0; i < matches.length; i++) {
		console.log(matches[i]);
	}
}


function textChanged(index) {

	const searches = [];

	for(let i = 0; i < 4; i++) {
		const input = document.getElementById(`input${i}`);
		if(input.value && input.value.length == 5) {
			searches.push({
				tokens: input.value.toLowerCase(),
				colors: getColors(i)
			});
		}
	}

	prepareSearches(searches);

	const matches = findMatches(words, searches);
	if(matches.length > 20) {
		matches.length = 20;
	}

	const resultsView = document.getElementById("results");
	resultsView.innerText = matches.join("\n");
}


function getColors(row) {
	
	const colors = [];
	for(let i = 0; i < 5; i++) {
		const div = document.getElementById(`color${row}${i}`);
		colors.push(div.getAttribute("data-color") || 'b');
	}

	return colors.join("");
}


function updateColor(row, col) {
	const div = document.getElementById(`color${row}${col}`);
	const color = div.getAttribute("data-color");
	let nextColor = '';
	let nextBkgnd = '';
	if(color == 'y') {
		nextColor = 'g';
		nextBkgnd = 'green';
	}
	else if(color == 'g') {
		nextColor = 'b';
		nextBkgnd = 'darkgray';
	}
	else {
		nextColor = 'y';
		nextBkgnd = 'yellow';
	}
	div.setAttribute("data-color", nextColor);
	div.style.background = nextBkgnd;

	textChanged(0);
}


function findMatches(words, searches) {

	const result = [];

	for(let i = 0; i < searches.length; i++) {
		const search = searches[i];
		search.forbidden = new Set();
		search.required = [];
		getRequiredAndForbiddenLetters(search, search.required, search.forbidden);
	}

	for(let i = 0; i < words.length; i++) {
		if(matchesAllSearches(words[i], searches)) {
			result.push(words[i]);
		}
	}

	return result;
}


function matchesAllSearches(word, searches) {

	for(let i = 0; i < searches.length; i++) {
		if(!matchesSearch(word, searches[i])) {
			return false;
		}
	}

	return true;
}


function matchesSearch(word, search) {

	const tokens = search.tokens;
	const colors = search.colors;
	const forbidden = search.forbidden;
	const required = [...search.required];

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


function prepareSearches(searches) {

	for(let i = 0; i < searches.length; i++) {
		const search = searches[i];
		search.forbidden = new Set();
		search.required = [];
		getRequiredAndForbiddenLetters(search, search.required, search.forbidden);
	}
}


function getRequiredAndForbiddenLetters(search, required, forbidden) {

	for(let i = 0; i < search.tokens.length; i++) {

		const token = search.tokens[i];
		switch(search.colors[i]) {

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
