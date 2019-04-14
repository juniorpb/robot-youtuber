const readline = require('readline-sync')
const state = require('./state.js')

function robot() {

	const content = {
		maximumSentences: 7
	}

	content.searchTerm = askAndReturnSeachTerm()
	content.prefix = askAndReturnPrefix()
	state.save(content)

	function askAndReturnSeachTerm() {
			return readline.question('Busque na Wikipedia: ')
	}

	function askAndReturnPrefix(){
		const prefixes = ['Who is','Whats is','The history of']
		const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
		const selectedPrefixText = prefixes[selectedPrefixIndex]

		return selectedPrefixText
	}
}

module.exports = robot