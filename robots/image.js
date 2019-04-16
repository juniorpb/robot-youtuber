const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')

async function robot() {
	const content = state.load()

	await fetchImageOfAllSentences(content)

	state.save(content)

	async function fetchImageOfAllSentences(content){
		for (const sentence of content.sentences) {
			const query = `${content.searchTerm} ${sentence.keywords[0]}`
			sentence.images = await fetchGoogleAndReturnImageLinsk(query)

			sentence.googleSearchQuery = query
		}
	}

	// const imageArray = await fetchGoogleAndReturnImageLinsk("Neymar")
	// console.dir(imageArray, {depth: null})
	// process.exit(0)

	async function fetchGoogleAndReturnImageLinsk(query){
		const response = await customSearch.cse.list({
			auth: googleSearchCredentials.apiKey,
			cx: googleSearchCredentials.searcheEngineId,
			q: query,
			searchType: 'image',
			// imgSize: 'huge',
			num: 2
		})

		const imageUrl = response.data.items.map((item) => {
			return item.link
		})

		return imageUrl
	}

}

module.exports = robot