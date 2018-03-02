import Input from "../presentational/Input";
import React, { Component } from "react";
import ReactDOM from 'react-dom';
class FormContainer extends Component {
  constructor() {
    super();
    this.state = {
      seo_title: ""
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    this.setState({ [event.target.id]: event.target.value });
  }
  render() {
    const { seo_title } = this.state;
    return (
      <form id="article-form">
        <Input
          text="FOOOOOOPO"
          label="seo_title"
          type="text"
          id="seo_title"
          value={seo_title}
          handleChange={this.handleChange}
        />
      </form>
    );
  }
}
export default FormContainer;

document.addEventListener("DOMContentLoaded", function(event) {
  const wrapper = document.getElementById("create-article-form")
  ReactDOM.render(<FormContainer />, wrapper)
});
