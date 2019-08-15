# uqlibrary-autosuggest-input

[![Codeship Status for uqlibrary/uqlibrary-autosuggest-input](https://app.codeship.com/projects/37407a20-064f-0137-bd65-72668c43ff9d/status?branch=master)](https://codeship.com/projects/325633)
[![Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-autosuggest-input.svg)](https://david-dm.org/uqlibrary/uqlibrary-autosuggest-input)
[![Dev Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-autosuggest-input/dev-status.svg)](https://david-dm.org/uqlibrary/uqlibrary-autosuggest-input?type=dev)

uqlibrary-autosuggest-input is an input field with autosuggest display

Full documentation can be found at [GitHub Pages](http://uqlibrary.github.io/uqlibrary-autosuggest-input/uqlibrary-autosuggest-input/).

## Getting Started

Install Node.JS and run the following in the project directory:

```sh
npm install -g bower web-component-tester polymer-cli
npm install
bower install
```

## Developing

* Please adhere to the Polymer code style guide provided at [Style Guide](http://polymerelements.github.io/style-guide/).
* Colors and common styles are imported (bower install) from [uqlibrary-styles](http://github.com/uqlibrary/uqlibrary-styles).
* GitHub pages should be updated after every commit to `master` branch by running `bin/generate-gh-pages.sh`
* A preview of the component can be viewed locally by running `npm start`. Use the second URL from the command output.

## Testing

Tests are run using the Web Component Tester using the command line:

```sh
npm test
```
