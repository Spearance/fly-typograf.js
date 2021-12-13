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

export class FlyTypograf {
	#original = ``
	#result = ``

	constructor (textElement) {
		this._element = textElement

		this._leftQuote = `«`
		this._rightQuote = `»`
	}

	get result() {
		return this.#result
	}

	get original() {
		return this.#original
	}

	set original(text) {
		this.#original = text;
	}

	process () {
		this.#original = this._element.value

		this.#result = this.#original
			// Minus
			.replace(/\u0020-(\d)/g, `\u0020−$1`)

			// Dash
			.replace(/(^|\n|\s|>)\-(\s)/g, `$1—$2`)

			// Double hyphen
			.replace(/(?<![-!])-{2} /g, `— `)

			// Multiple nbsp
			.replace(/\u00a0{2,}|\u00a0\u0020|\u0020\u00a0/g, `\u00a0`)

			// Numerical interval
			.replace(/(\d)(?:\u0020)?[-—](?:\u0020)?(\d)/g, (str, $1, $2) => `${$1}–${$2}`)

			// Copyright
			.replace(/\([cс]\)/ig, `©`)

			// Registered trademark
			.replace(/\(r\)/ig, `®`)

			// Trademark
			.replace(/\(tm\)/ig, `™`)

			// Rouble
			.replace(/\([рp]\)/ig, `₽`)

			// Three dots
			.replace(/\.{3}/g, `…`)

			// Sizes
			.replace(/(\d)[xх](\d)/ig, `$1×$2`)

			// Open quote
			.replace(/\"([a-z0-9\u0410-\u042f\u0401…])/ig, `${this._leftQuote}$1`)

			// Close quote
			.replace(/([a-z0-9\u0410-\u042f\u0401…?!])\"/ig, `$1${this._rightQuote}`)

			// Open quote
			.replace(new RegExp(`\"(${this._leftQuote}[a-zа-яё0-9…])`, `ig`), `${this._leftQuote}$1`)

			// Close quote
			.replace(new RegExp(`([a-zа-яё0-9…?!]${this._rightQuote})\"`, `ig`), `$1${this._rightQuote}`)

			// Fix HTML open quotes
			.replace(new RegExp(`([-a-z0-9]+=)[${this._leftQuote}${this._rightQuote}]([^${this._leftQuote}${this._rightQuote}]*?)`, `ig`), `$1\"$2`)

			// Fix HTML close quotes
			.replace(new RegExp(`([-a-z0-9]+=)[\"]([^>${this._leftQuote}${this._rightQuote}]*?)[${this._leftQuote}${this._rightQuote}]`, `ig`), `$1\"$2\"`)

			// Minutes and seconds
			.replace(new RegExp(`([0-6]?[0-9])[\'\′]([0-6]?[0-9])?(\\d+)[${this._rightQuote}\"]`, `g`), `$1\′$2$3\″`)

			// Prepositions
			.replace(/((?:^|\n|\t|[\u00a0 ]|>)[a-zа-яё]{1,2}) /ig, `$1\u00a0`)

			.replace(/\-(то|ка)\u00a0/gi, `-$1\u0020`)

			.replace(/(?:\s|\t|[\u00a0 ])(же?|л[иь]|бы?|ка)([.,!?:;])?\u00a0/ig, `\u00a0$1$2\u0020`);

			this._element.value = this.#result;
	}
}
