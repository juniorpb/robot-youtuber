const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')

async function robot() {
	const content = state.load()

	// await fetchImageOfAllSentences(content)
	await downloadAllImagem(content)
	// state.save(content)

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

	async function downloadAllImagem(content) {
		content.downloadedImagem = []

	
		for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
			const images = content.sentences[sentenceIndex].images

			for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
				const imageUrl = images[imageIndex]

				try{
					if(content.downloadedImagem.includes(imageUrl)) {
						console.log('Imagem já foi baixada.')
					}
					
					await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
					content.downloadedImagem.push(imageUrl)
					console.log(`> [${sentenceIndex}][${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`)
					break

				} catch(error) {
					console.log(`> [${sentenceIndex}][${imageIndex}] Erro ao baixar imagem: ${imageUrl}`)

				}
			}

		}
	}

	async function downloadAndSave(url, fileName) {
		return imageDownloader.image({
			url: url, 
			dest: `./content/${fileName}`
		})
	}
}

module.exports = robot