import {FlyTypograf} from '../FlyTypograf.js';

const textarea = document.querySelector(`#typograf`)
const highLight = document.querySelector(`#highLight`)

// Highlight changed text for demo only
textarea.addEventListener(`keyup`, () => {
  highLight.innerHTML = `<p>${textarea.value
    .replace(/\u00a0/g, `<span class="hlg">&nbsp\;</span>`)

    .replace(/([…©®™₽×—–−„“«»″′’½⅓¼⅕⅙⅛⅔⅖¾⅗⅜⅘⅚⅝⅞±])/g, `<span class="hlb">$1</span>`)

    .replace(/\n{2,}/g, "</p><p>")

    .replace(/\n/g, "<br />")}</p>`
});

const Typograf = new FlyTypograf(textarea)

const onTextAreaInput = () => {
  Typograf.process()
}

textarea.addEventListener(`input`, onTextAreaInput)
