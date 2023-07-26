import { FlyTypograf } from './fly-typograf.js'

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
				.replace(/="?(?:javascript|void):/gi, `="#`)
				.replace(/(<\/?[a-z]+[^>]*?>)/gi, (str, $1) => {
					tags.push($1)
					return `<*>`
				})
				.replace(/\n{2,}/g, "</p><p>")
				.replace(/\n/g, "<br />")
				.replace(/\u00a0/g, `<span class="hlg">&nbsp;</span>`)
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
const INTERVAL = 100;
const Button = {
	START: `напечатать`,
	STOP: `остановить`
}

const example = document.querySelector(`#example`).innerText
const button = document.querySelector(`#type`)

let timer = null;

const returnState = () => {
	clearInterval(timer)
	button.textContent = Button.START
	timer = null
}

const onButtonClick = () => {
	if (timer) {
		returnState()
		return
	}

	textarea.value = ``
	button.textContent = Button.STOP
	let count = 0

	timer = setInterval(() => {
		const currentText = example.substring(0, count + 1)

		textarea.value = currentText
		count = textarea.value.length

		Typograf.process()

		if (count < textarea.value.length) {
			count = textarea.value.length
		}

		printHighLighted()

		if (currentText.length >= example.length) {
			returnState()
		}
	}, INTERVAL)
}

button.addEventListener(`click`, onButtonClick)
