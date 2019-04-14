const algorithmia 				= require('algorithmia')
const algorithmiaApiKey 		= require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection	= require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
 
const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

const state = require('./state.js')

async function robot() {
	const content = state.load()
	await fetchContentFromWikipedia(content)
	sanitizeContent(content)
	breakContentIntoSentences(content)
	limitMaximumSentences(content)
	await fetchKeywordsOfAllSentences(content)

	state.save(content)
	
	async function fetchContentFromWikipedia(content) {
		const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
		const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
		const wikipediaResponde = await wikipediaAlgorithm.pipe({
			"lang" : "pt", // set linguage
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

	// total de sentences
	function limitMaximumSentences(content) {
		content.sentences = content.sentences.slice(0, content.maximumSentences)
	}

	// adc sentence na estrutura de dados
	async function fetchKeywordsOfAllSentences(content) {
		for (const sentence of content.sentences) {
			sentence.keywords = await fetWatsonAndReturnKeywords(sentence.text)
		}
	}

	// retorna palavras chaves de uma sentence
	async function fetWatsonAndReturnKeywords(sentence) {
		return new Promise((resolve, reject) =>{
			nlu.analyze({
				text: sentence,
				features: {
					keywords: {}
				}
			}, (error, response) => {
				if (error) {
					throw error
				}

				// retorna arraylist com palavras chaves
				const keywords = response.keywords.map((keywords) => { 
					return keywords.text
				})

				resolve(keywords)
			})
		})
	}

}


module.exports = robot