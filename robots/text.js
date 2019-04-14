const algorithmia 				= require('algorithmia')
const algorithmiaApiKey 		= require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection	= require('sbd')

async function robot(content) {
	await fetchContentFromWikipedia(content)
	sanitizeContent(content)
	breakContentIntoSentences(content)

	async function fetchContentFromWikipedia(content) {
		const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
		const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
		const wikipediaResponde = await wikipediaAlgorithm.pipe({
			"lang" : "pt",
			"articleName" : content.searchTerm
		})
		const wikipediaContent = wikipediaResponde.get()

		// Salvando busca na estrutura de dados
		content.sourceContentOriginal = wikipediaContent.content
	}

	function sanitizeContent(content) {
		const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
		const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

		content.sourceContentSanitized = withoutDatesInParentheses

		// remove linhas em branco e linhas que inicia com '='
		function removeBlankLinesAndMarkdown(text) {
			const allLines = text.split('\n')

			const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
				if (line.trim().length === 0 || line.trim().startsWith('=')) {
					return false
				}

				return true
			})

			return withoutBlankLinesAndMarkdown.join(' ')
		}
	}

	// remove datas
	function removeDatesInParentheses(text){
		return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
	}

	function breakContentIntoSentences(content) {
		content.sentences = []

		const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
		sentences.forEach((sentence) => {
			content.sentences.push({
				text: sentence,
				keywords: [],
				images: []
			})
		})
	}
}


module.exports = robot