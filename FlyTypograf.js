/*
	FlyTypograf.js

	https://github.com/Spearance/FlyTypograf.js
	https://typograf.ru

	Copyright 2021, Evgeniy Lepeshkin

	Released under the MIT license.
	http://www.opensource.org/licenses/mit-license.php

	Version: v 1.1.1
	Date: Dec 26, 2021
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
		"1/7": `⅐`,
		"1/8": `⅛`,
		"1/9": `⅑`,
		"1/10": `⅒`,
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

	#prepare = [
		{
			// Remove non-breaking space with simple space
			pattern: /\u00A0 | \u00A0/g,
			replace: `  `
		},
		{
			// Remove thin non-breaking space with simple space
			pattern: /\u202F | \u202F/g,
			replace: ` `
		},
		{
			// Remove multiply non-breaking spaces
			pattern: /[\u00A0\u202F]+/g,
			replace: ` `
		},
		{
			// Remove dashes and minuses
			pattern: /[—–−]/g,
			replace: `-`
		}
	]

	#process = [
		{
			// Minus sign
			pattern: /(?<= |^|\d)[—-](\d)/g,
			replace: `−$1`
		},
		{
			// Double hyphen
			pattern: /(?<![!])--(?!>)/g,
			replace: () => {
				this.#caretPosition--
				return `-`
			}
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
			// Dash sign
			pattern: /(?<= |^|>|[^-!а-яёa-z0-9])-(?= |$|[^-])/gmi,
			replace: `—`
		},
		{
			// Non-breaking space with dash sign
			pattern: /(?<!^|[":;.!?…, ]) —(?!-)/gm,
			replace: `\u00A0—`
		},
		{
			// Dash sign with non-breaking space
			pattern: /([ ]+)—([ ]*?)([a-zа-яё0-9])/gmi,
			replace: (str, $1, $2, $3) => {
				this.#caretPosition -= ($1.length ? $1.length - 1 : 0) + ($2.length ? $2.length - 1 : 0)
				return ` —\u00A0${$3}`
			}
		},
		{
			// Numerical interval
			pattern: new RegExp(`(\\d|[${Object.values(this.#decimals).join('')}])\\s?[-—]\\s?(\\d|[${Object.values(this.#decimals).join('')}])`, `g`),
			replace: (str, $1, $2) => {
				this.#caretPosition -= str.length - `${$1}−${$2}`.length
				return `${$1}−${$2}`
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
			// Decimals like 1/2
			pattern: /\b([123457]\/(?:[2-9]|10))\b/g,
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
			pattern: /["»](\S)/ig,
			replace: `${this.#leftQuote}$1`
		},
		{
			// Close quote
			pattern: /(\S)["«]/ig,
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
			pattern: /((?:[ \u00A0]|>|^|\t)[a-zа-яё]{1,2}) /igm,
			replace: `$1\u00A0`
		},
		{
			// Particles with dash and non-breaking space
			pattern: /-(то|ка)\u00A0/gi,
			replace: `-$1 `
		},
		{
			// Particles
			pattern: /(?:\s|\t|[\u00A0 ])(же?|л[иь]|бы?|ка)([.,!?:;])?\u00A0/ig,
			replace: `\u00A0$1$2 `
		}
	];

	constructor (textElement, preference) {
		this._element = textElement
		this._isContentEditable = this._element.contentEditable === true

		if (preference) {
			this.#leftQuote = preference.leftQuote || `«`
			this.#rightQuote = preference.rightQuote || `«`
		}
	}

	get result() {
		return this.#result
	}

	process () {
		this.#result = this._element.value

		this.#applyRules(this.#prepare)

		this.#getCaretPosition()

		this.#applyRules(this.#process)

		this._element.value = this.#result

		this.#setCaretPosition(this.#caretPosition)
	}

	#applyRules (array) {
		array.forEach((regex) => {
			this.#result = this.#result.replace(regex.pattern, regex.replace)
		})
	}

	#getCaretPosition () {
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

	#setCaretPosition (pos) {
		if (this._isContentEditable) {
			this._element.focus()
			document.getSelection().collapse(this._element, pos)
			return
		}

		this._element.setSelectionRange(pos, pos)
	}
}
