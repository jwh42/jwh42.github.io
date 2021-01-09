const n = getInputNumber();
const list = [];

for(let i = 2; i < n; i++) {
	if(n % i == 0) {
		list.push(i);
	}
}

for(let j = 0, jmax = Math.ceil(list.length/2); j < jmax; j++) {
	console.log(`${list[j]} * ${list[list.length - j - 1]}`);
}

function getInputNumber() {
	return process.argv.length > 2
		? parseInt(process.argv[2])
		: 100;
}
