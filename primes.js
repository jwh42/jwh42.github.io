const maxValue = getMaxValue();


for(let i = 3; i < maxValue; i += 2) {
	if(isPrime(i)) {
		console.log(formatNumber(i));
	}
}


function isPrime(i) {

	for(let j = 3, jmax = Math.floor(i/2); j < jmax; j += 2) {		
		if(i % j == 0) {
			return false;
		}
	}
	
	return true;
}


function formatNumber(i) {
	
	const digits = Math.floor(Math.log10(i)) + 1;
	return ' '.repeat(8 - digits) + i.toString();
}


function getMaxValue() {
	return process.argv.length > 2
		? parseInt(process.argv[2])
		: 100;
}