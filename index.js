const readline = require('readline-sync')

function start() {
	const content = {}

	content.searchTerm = askAndReturnSeachTerm()
	content.prefix = askAndReturnPrefix()

	function askAndReturnSeachTerm() {
		return readline.question('Type a Wikipedia seach term: ')
	}

	function askAndReturnPrefix(){
		const prefixes = ['Who is','Whats is','The history of']
		const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
		const selectedPrefixText = prefixes[selectedPrefixIndex]

		return selectedPrefixText
	}

	console.log(content)
}

start()