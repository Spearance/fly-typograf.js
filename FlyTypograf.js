/*
	FlyTypograf.js

	https://github.com/Spearance/FlyTypograf.js
	https://typograf.ru

	Copyright 2021, Evgeniy Lepeshkin

	Released under the MIT license.
	http://www.opensource.org/licenses/mit-license.php

	Version: v 1.0
	Date: Aug 26, 2021
 */

export class FlyTypograf {
	#original = ``
	#result = ``
	#caretPosition = 0

	#leftQuote = `«`
	#rightQuote = `»`

	#decimals = {
		"1/2": `½`,
		"1/3": `⅓`,
		"1/4": `¼`,
		"1/5": `⅕`,
		"1/6": `⅙`,
		"1/8": `⅛`,
		"2/3": `⅔`,
		"2/5": `⅖`,
		"3/4": `¾`,
		"3/5": `⅗`,
		"3/8": `⅜`,
		"4/5": `⅘`,
		"5/6": `⅚`,
		"5/8": `⅝`,
		"7/8": `⅞`
	}

	#rules = [
		{
			// Minus sign
			pattern: / -(\d)/g,
			replace: ` −$1`
		},
		{
			// Dash sign
			pattern: /(^|\n|\s|>)\-(\s)/g,
			replace: `$1—$2`
		},
		{
			// Double hyphen
			pattern: /(?<![-!])-{2} /g,
			replace: () => {
				this.#caretPosition--
				return `— `
			}
		},
		{
			// Multiple spaces
			pattern: /\u00a0{2,}|\u00a0 | \u00a0/g,
			replace: (str) => {
				this.#caretPosition -= str.length - 1
				return `\u00a0`
			}
		},
		{
			// Numerical interval
			pattern: /(\d)\s?[-—]\s?(\d)/g,
			replace: (str, $1, $2) => {
				this.#caretPosition -= str.length - `${$1}–${$2}`.length
				return `${$1}–${$2}`
			}
		},
		{
			// Copyright (c)
			pattern: /\([cс]\)/ig,
			replace: () => {
				this.#caretPosition -= 2
				return `©`
			}
		},
		{
			// Registered trademark (R)
			pattern: /\(r\)/ig,
			replace: () => {
				this.#caretPosition -= 2
				return `®`
			}
		},
		{
			// Trademark (TM)
			pattern: /\(tm\)/ig,
			replace: () => {
				this.#caretPosition -= 3
				return `™`
			}
		},
		{
			// Rouble (р)
			pattern: /\(р\)/ig,
			replace: () => {
				this.#caretPosition -= 2
				return `₽`
			}
		},
		{
			// Three dots
			pattern: /(?<![.…])\.{3}/g,
			replace: () => {
				this.#caretPosition -= 2
				return `…`
			}
		},
		{
			// Fix more then three dots
			pattern: /…(\.+)/g,
			replace: (str, $1) => {
				this.#caretPosition += 2
				return `...${$1}`
			}
		},
		{
			// Sizes
			pattern: /(\d)[xх](\d)/ig,
			replace: `$1×$2`
		},
		{
			// Plus/Minus +/-
			pattern: /\+\/\-/g,
			replace: () => {
				this.#caretPosition -= 2
				return `±`
			}
		},
		{
			// Decimals like 1/2
			pattern: /\b([123457]\/[234568])\b/g,
			replace: (str, $1) => {
				if (this.#decimals[`${$1}`]) {
					this.#caretPosition -= 2
				}
				return this.#decimals[`${$1}`] ? this.#decimals[`${$1}`] : `${$1}`
			}
		},
		{
			// Fix decimals with next number
			pattern: new RegExp(`([${Object.values(this.#decimals).join('')}])(\\d)`, `g`),
			replace: (str, $1, $2) => {
				this.#caretPosition += 2
				return `${Object.entries(this.#decimals).find(i => i[1] === $1)[0]}${$2}`
			}
		},
		{
			// Open quote
			pattern: /["»]([a-z0-9а-яё…])/ig,
			replace: `${this.#leftQuote}$1`
		},
		{
			// Close quote
			pattern: /([a-z0-9а-яё…?!])["«]/ig,
			replace: `$1${this.#rightQuote}`
		},
		{
			// Open quote
			pattern: new RegExp(`"(${this.#leftQuote}[a-zа-яё0-9…])`, `ig`),
			replace: `${this.#leftQuote}$1`
		},
		{
			// Close quote
			pattern: new RegExp(`([a-zа-яё0-9…?!]${this.#rightQuote})"`, `ig`),
			replace: `$1${this.#rightQuote}`
		},
		{
			// Fix HTML open quotes
			pattern: new RegExp(`([-a-z0-9]+=)[${this.#leftQuote}${this.#rightQuote}]([^${this.#leftQuote}${this.#rightQuote}]*?)`, `ig`),
			replace: `$1"$2`
		},
		{
			// Fix HTML close quotes
			pattern: new RegExp(`([-a-z0-9]+=)[\"]([^>${this.#leftQuote}${this.#rightQuote}]*?)[${this.#leftQuote}${this.#rightQuote}]`, `ig`),
			replace: `$1"$2"`
		},
		{
			// English apos
			pattern: /\b'([std]|ve|ll|clock)\b/ig,
			replace: `’$1`
		},
		{
			// Minutes and seconds
			pattern: new RegExp(`([0-6]?[0-9])[\'\′]([0-6]?[0-9])?(\\d+)[${this.#rightQuote}\"]`, `g`),
			replace: `$1′$2$3″`
		},
		{
			// Prepositions
			pattern: /((?:^|\n|\t|[\u00a0 ]|>)[a-zа-яё]{1,2}) /ig,
			replace: `$1\u00a0`
		},
		{
			// Particles with dash and non-breaking space
			pattern: /\-(то|ка)\u00a0/gi,
			replace: `-$1 `
		},
		{
			// Particles
			pattern: /(?:\s|\t|[\u00a0 ])(же?|л[иь]|бы?|ка)([.,!?:;])?\u00a0/ig,
			replace: `\u00a0$1$2 `
		}
	];

	constructor (textElement) {
		this._element = textElement
		this._isContentEditable = this._element.contentEditable === true
	}

	get result() {
		return this.#result
	}

	process () {
		this.#result = this._element.value

		this._getCaretPosition()

		this.#rules.forEach((regex) => {
			this.#result = this.#result.replace(regex.pattern, regex.replace)
		})

		this._element.value = this.#result

		this._setCaretPosition(this.#caretPosition)
	}

	_getSelectionText () {
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

	_getCaretPosition () {
		if (this._isContentEditable) {
			this._element.focus()
			let _range = document.getSelection().getRangeAt(0)
			let range = _range.cloneRange()
			range.selectNodeContents(this._element)
			range.setEnd(_rang.endContainer, _range.endOffset)
			return range.toString().length
		}

		this.#caretPosition = this._element.selectionStart
	}

	_setCaretPosition (pos) {
		if (this._isContentEditable) {
			this._element.focus()
			document.getSelection().collapse(this._element, pos)
			return
		}

		this._element.setSelectionRange(pos, pos)
	}
}
