import Input from '../presentational/Input'
import React from 'react'
import { Component } from 'react'
import ReactDOM from 'react-dom'
class FormContainer extends Component {
	constructor () {
		super()
		this.state = {
			data: ''
		}
		this.handleChange = this.handleChange.bind(this)
	}
	handleChange (event) {
		const len = event.target.value.length - 1
		if (event.target.value[len] === ' ') {
			this.setState({[event.target.id]: event.target.value.substring(0, len) + 'ay '})
		} else {
			this.setState({[event.target.id]: event.target.value})
		}
	}
	render () {
		const { data } = this.state
		return (
			<div>
				<form id="article-form">
					<Input
						text="Piggify"
						label="data"
						type="text"
						id="data"
						value={data}
						handleChange={this.handleChange}
					/>
				</form>
				<h1 className="text-5xl text-green font-sans">{data}</h1>
			</div>
		)
	}
}
export default FormContainer

document.addEventListener('DOMContentLoaded', function () {
	const wrapper = document.getElementById('react')
	ReactDOM.render(<FormContainer />, wrapper)
})
