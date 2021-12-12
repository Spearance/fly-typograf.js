/*
FlyTypograf.js

	https://github.com/Spearance/FlyTypograf.js
	http://www.typograf.ru/

	Copyright 2021, Evgeniy Lepeshkin

	Released under the MIT license.
	http://www.opensource.org/licenses/mit-license.php

	Version: v 0.1
	Date: Aug 26, 2021
 */

export default class FlyTypograf {
	constructor (textElement) {
		this._element = textElement

		this._original = this._element.value
		this._result = ``

		this._leftQuote = `«`
		this._rightQuote = `»`

		this._element.addEventListener(`input`, this._onTextElementInput)
	}

	get result () {
		return this._result
	}

	get original () {
		return this._original
	}

	process () {
		let caretPosition = this._getCaretPosition(this._element)

			this._result = this._original
				// Minus
				.replace(/\u0020-(\d)/g, `\u0020−$1`)

				// Dash
				.replace(/(^|\n|\s|>)\-(\s)/g, `$1—$2`)

				// Double hyphen
				.replace(/\-{2} /g, () => {
					caretPosition--
					return `— `
				})

				// Multiple nbsp
				.replace(/\u00a0{2,}|\u00a0\u0020|\u0020\u00a0/g, (str) => {
					caretPosition -= str.length - 1
					return `\u00a0`
				})

				// HTML-comment
				.replace(/<!—/ig, () => {
					caretPosition++
					return `<!--`;
				})

				// Numerical interval
				.replace(/(\d)(\u0020)?[-—](\u0020)?(\d)/g, function(str, $1, $2, $3, $4){
					if ($2 == "\u0020") { caretPosition-- }
					if ($3 == "\u0020") { caretPosition-- }
					return $1 + "–" + $4;
				})

				// Copyright
				.replace(/\([cс]\)/ig, function(){
					caretPosition -= 2;
					return "©";
				})

				// Registered trademark
				.replace(/\(r\)/ig, function(){
					caretPosition -= 2;
					return "®";
				})

				// Trademark
				.replace(/\(tm\)/ig, function(){
					caretPosition -= 2;
					return "™";
				})

				// Rouble
				.replace(/\([рp]\)/ig, function(){
					caretPosition -= 2;
					return "₽";
				})

				// Three dots
				.replace(/\.{3}/g, function(){
					caretPosition -= 2;
					return "…";
				})

				// Sizes
				.replace(/(\d)[xх](\d)/ig, "$1×$2")

				// Open quote
				.replace(/\"([a-z0-9\u0410-\u042f\u0401…])/ig,
								 this._leftQuote + "$1")

				// Close quote
				.replace(/([a-z0-9\u0410-\u042f\u0401…?!])\"/ig,
								 "$1" + this._rightQuote)

				// Open quote
				.replace(new RegExp("\"(" + this._leftQuote + "[a-z0-9\u0410-\u042f\u0401…])", "ig"),
								 this._leftQuote + "$1")

				// Close quote
				.replace(new RegExp("([a-z0-9\u0410-\u042f\u0401…?!]" + this._rightQuote + ")\"", "ig"),
								 "$1" + this._rightQuote)

				// Fix HTML open quotes
				.replace(new RegExp("([-a-z0-9]+=)" +
														"["   + this._leftQuote + this._rightQuote + "]" +
														"([^" + this._leftQuote + this._rightQuote + "]*?)", "ig"),
								 "$1\"$2")

				// Fix HTML close quotes
				.replace(new RegExp(`([-a-z0-9]+=)[\"]([^>${this._leftQuote}${this._rightQuote}]*?)[${this._leftQuote}${this._rightQuote}]`, "ig"), "$1\"$2\"")

				// Degree
				.replace(new RegExp("([0-6]?[0-9])[\'\′]([0-6]?[0-9])?(\\d+)" +
									"[" + this._rightQuote + "\"]", "g"),
						 "$1\′$2$3\″")

				// Prepositions
				.replace(new RegExp("((?:^|\n|\t|[\u00a0\u0020]|>)[A-Z\u0410-\u042f\u0401]{1,2})\u0020", "ig"),
						 "$1\u00a0")

				.replace(/\-(то|ка)\u00a0/gi, "-$1\u0020")

				.replace(new RegExp("(?:\s|\t|[\u00a0\u0020])(же?|л[иь]|бы?|ка)([.,!?:;])?\u00a0", "ig"),
						 "\u00a0$1$2\u0020");

			this.element.value = this._result;

			if (!exclude) {
				setCaretPosition(this._element, caretPosition);
			}
	}

	_getCaretPosition (element) {
		let caretPosition = 0
		let selection

		if (document.selection) {
			element.focus()
			selection = document.selection.createRange()
			selection.moveStart(`character`, -element.value.length)
			caretPosition = selection.text.length
		} else if (element.selectionStart || element.selectionStart == `0`) {
			caretPosition = element.selectionStart
		}

		return caretPosition
	}

	_onTextElementInput () {
		console.log(this.result())
		return this.process()
	}
/*
	_setCaretPosition (element, pos) {
		//if (element.setSelectionRange) {
			element.focus();
			element.setSelectionRange(pos, pos);
		// } else if (element.createTextRange) {
		// 	let range = element.createTextRange();
		// 	range.collapse(true);
		// 	range.moveEnd("character", pos);
		// 	range.moveStart("character", pos);
		// 	range.select();
		// }
	}

	getSelectionText () {
		if (window.getSelection) {
			return window.getSelection()
		}
		if (document.getSelection) {
			return document.getSelection()
		}
		if (document.selection) {
			return document.selection.createRange().text
		}
	}
*/
}
