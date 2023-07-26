/*
	https://github.com/Spearance/fly-typograf.js

	Copyright 2023, Evgeniy Lepeshkin

	Released under the MIT license.
	http://www.opensource.org/licenses/mit-license.php

	Version: v 1.2.7
	Date: Jul 8, 2023
 */

export class FlyTypograf {
	#result = ``
	#source = ``
	#caretPosition = 0

	#isMoveCaret = true;
	#leftOutQuote = `«`
	#rightOutQuote = `»`

	#decimal = {
		literals: {
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
		},
		values: function () {
			return Object.values(this.literals).join(``)
		}
	}

	#upIndex = {
		literals: {
			"0": `⁰`,
			"1": `¹`,
			"2": `²`,
			"3": `³`,
			"4": `⁴`,
			"5": `⁵`,
			"6": `⁶`,
			"7": `⁷`,
			"8": `⁸`,
			"9": `⁹`,
			"—": `⁻`,	// mdash
			"+": `⁺`,
			"=": `⁼`,
			"(": `⁽`,
			")": `⁾`,
			"o": `°`,	// en `o`
			"о": `°`,	// ru `o`
			"\"": `″`
		},
		values: function () {
			return Object.values(this.literals).join(``)
		}
	}

	// rules for preparing text
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
			// Remove double dashes
			pattern: /(?<![!-])--(?![->])/g,
			replace: () => {
				this.#caretPosition--
				return `-`
			}
		},
		{
			// Remove dashes, ndashes and minuses
			pattern: /([—–−])/g,
			replace: `-`
		}
	]

	// basic rules
	#process = [
		{
			// Minus sign
			pattern: new RegExp(`(?<= |^|\\d|[${this.#decimal.values()}])-(?=\\d|[${this.#decimal.values()}])`, `g`),
			replace: `−`
		},
		{
			// Plus/Minus +/-
			pattern: /\+\/-/g,
			replace: () => {
				this.#caretPosition -= 2
				return `±`
			}
		},
		{
			// Division
			pattern: /(?<=(?:\d|[a-z])\s*)-:-/gi,
			replace: () => {
				this.#caretPosition -= 2
				return `÷`
			}
		},
		{
			// Dash sign
			pattern: /(?<= |^|>|[^-!а-яёa-z0-9])-(?= |$|[^-])/gi,
			replace: `—`
		},
		{
			// Non-breaking space with dash sign
			pattern: /(?<!^|["»:;.!?…, ]) —(?!-)/gm,
			replace: `\u00A0—`
		},
		{
			// Dash sign with non-breaking space
			pattern: /([ ]+)—([ ]*?)(["«a-zа-яё0-9])/gmi,
			replace: (str, $1, $2, $3) => {
				this.#caretPosition -= ($1.length ? $1.length - 1 : 0) + ($2.length ? $2.length - 1 : 0)
				return ` —\u00A0${$3}`
			}
		},
		{
			// Fix minus at start line
			pattern: /—(?=\d)/g,
			replace: `−`
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
			pattern: /(?<![.…])\.{3}(?!\.)/g,
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
			// Size
			pattern: /(\d)[xх](\d)/ig,
			replace: `$1×$2`
		},
		{
			// Decimal like 1/2
			pattern: /\b([123457]\/(?:[2-9]|10))\b/g,
			replace: (str, $1) => {
				if (this.#decimal.literals[$1]) {
					this.#caretPosition -= 2
				}
				return this.#decimal.literals[$1] ? this.#decimal.literals[$1] : $1
			}
		},
		{
			// Fix decimal with next number
			pattern: new RegExp(`([${this.#decimal.values()}])(\\d)`, `g`),
			replace: (str, $1, $2) => {
				this.#caretPosition += 2
				return `${Object.entries(this.#decimal.literals).find(i => i[1] === $1)[0]}${$2}`
			}
		},
		{
			// Up index symbols
			pattern: /(\S)\^([0-9—+-=()]|[oо"])/gi,
			replace: (str, $1, $2) => {
				this.#caretPosition--
				return `${$1}${this.#upIndex.literals[$2] ? this.#upIndex.literals[$2] : $2}`
			}
		},
		{
			// Move up number up index symbols
			pattern: new RegExp(`([${this.#upIndex.values()}])(?![ .])([0-9+-=()])`, `g`),
			replace: (str, $1, $2) => {
				return `${$1}${this.#upIndex.literals[$2]}`
			}
		},
		{
			// Convert up index то number after space
			pattern: new RegExp(` ([${this.#upIndex.values()}])`, `g`),
			replace: (str, $1) => {
				for (let key in this.#upIndex.literals) {
					if (this.#upIndex.literals[key] === $1) {
						return ` ${key}`
					}
				}
			}
		},
		{
			// Open quote
			pattern: /["»](?=\S)/g,
			replace: this.#leftOutQuote
		},
		{
			// Close quote
			pattern: /(?<=\S)["«]/g,
			replace: this.#rightOutQuote
		},
		{
			// Open quote
			pattern: new RegExp(`"(${this.#leftOutQuote}[a-zа-яё0-9…])`, `ig`),
			replace: `${this.#leftOutQuote}$1`
		},
		{
			// Close quote
			pattern: new RegExp(`([a-zа-яё0-9…?!]${this.#rightOutQuote})"`, `ig`),
			replace: `$1${this.#rightOutQuote}`
		},
		{
			// Fix HTML open quotes
			pattern: new RegExp(`([-a-z0-9]+=)[${this.#leftOutQuote}${this.#rightOutQuote}]([^${this.#leftOutQuote}${this.#rightOutQuote}]*?)`, `ig`),
			replace: `$1"$2`
		},
		{
			// Fix HTML close quotes
			pattern: new RegExp(`([-a-z0-9]+=)["]([^>${this.#leftOutQuote}${this.#rightOutQuote}]*?)[${this.#leftOutQuote}${this.#rightOutQuote}]`, `ig`),
			replace: `$1"$2"`
		},
		{
			// English apos
			pattern: /\b'([std]|ve|ll|clock)\b/ig,
			replace: `’$1`
		},
		{
			// Minutes and seconds
			pattern: new RegExp(`([0-6]?[0-9])['′]([0-6]?[0-9])?(\\d+)[${this.#rightOutQuote}"]`, `g`),
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
		this.#source = this._element.value

		this.#isMoveCaret = preference?.isMoveCaret
		this.#leftOutQuote = preference?.leftOutQuote
		this.#rightOutQuote = preference?.rightOutQuote
	}

	get result () {
		return this.#result
	}

	get source () {
		return this.#source
	}

	process () {
		this.#result = this._element.value

		this.#applyRules(this.#prepare)
		this.#applyRules(this.#process)
	}

	#applyRules (array) {
		if (this.#isMoveCaret) {
			this.#caretPosition = this.#getCaretPosition()
		}

		array.forEach(regex => {
			this.#result = this.#result.replace(regex.pattern, regex.replace)
		})

		this._element.value = this.#result

		if (this.#isMoveCaret) {
			this.#setCaretPosition(this.#caretPosition)
		}
	}

	#getCaretPosition () {
		if (this._isContentEditable) {
			this._element.focus()
			let _range = document.getSelection().getRangeAt(0)
			let range = _range.cloneRange()
			range.selectNodeContents(this._element)
			range.setEnd(_range.endContainer, _range.endOffset)
			return range.toString().length
		}

		return this._element.selectionStart
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
