import {FlyTypograf} from './FlyTypograf.js';

// Usage FlyTypograf
const textarea = document.querySelector(`#typograf`)

const Typograf = new FlyTypograf(textarea)

const onTextAreaInput = () => {
  Typograf.process()
}

textarea.addEventListener(`input`, onTextAreaInput)


// Highlight changed text for demo only
const highLight = document.querySelector(`#highLight`)

const printHighLighted = () => {
	const tags = []
	highLight.innerHTML = `
		<p>
			${textarea.value
				.replace(/\bon[a-z]+="?[^">]+"?/gi, ``)
				.replace(/="?javascript:/gi, `="#`)
				.replace(/(<\/?[a-z]+[^>]*?>)/gi, (str, $1) => {
					tags.push($1)
					return `<*>`
				})
				.replace(/\n{2,}/g, "</p><p>")
				.replace(/\n/g, "<br />")
				.replace(/\u00a0/g, `<span class="hlg">&nbsp\;</span>`)
				.replace(/([…©®™₽×—–−„“«»″′’½⅓¼⅕⅙⅛⅔⅖¾⅗⅜⅘⅚⅝⅞±÷⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺⁼⁽⁾°]+)/gi, `<span class="hlb">$1</span>`)
				.replaceAll('<*>', () => {
					const str = tags[0]
					tags.splice(0, 1)
					return str
				})
			}
		</p>
	`
}

textarea.addEventListener(`keyup`, printHighLighted);


// autotype example
const example = document.querySelector(`#example`).innerText
const button = document.querySelector(`#type`)

const onButtonClick = () => {
	textarea.value = ``
	let count = 0

	let timer = setInterval(() => {
		textarea.value = example.substring(0, count + 1)

		count = textarea.value.length

		Typograf.process()

		if (count < textarea.value.length) {
			count = textarea.value.length
		}

		printHighLighted()

		if (example.substring(0, count + 1).length >= example.length) {
			clearInterval(timer)
		}
	}, 100)
}

button.addEventListener(`click`, onButtonClick)
