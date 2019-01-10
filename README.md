# uqlibrary-search

[![Codeship Status for uqlibrary/uqlibrary-search](https://app.codeship.com/projects/7dd65470-f6c2-0136-f70c-3ae289da7755/status?branch=polymer1.0)](/projects/321071)
[![Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-search.svg)](https://david-dm.org/uqlibrary/uqlibrary-search)
[![Dev Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-search/dev-status.svg)](https://david-dm.org/uqlibrary/uqlibrary-search?type=dev)

uqlibrary-search is a search form for UQ Library

Documentation is in [GitHub Pages](http://uqlibrary.github.io/uqlibrary-search/uqlibrary-search/).

## Getting Started

Install Node.JS and run the following in the project directory:

```sh
npm install -g bower web-component-tester
npm install
bower install
```

## Developing

* Please adhere to the Polymer code style guide provided at [Style Guide](http://polymerelements.github.io/style-guide/).
* Colors and common styles are imported (bower install) from [uqlibrary-styles](http://github.com/uqlibrary/uqlibrary-styles).
* GitHub pages should be updated after every commit to `polymer1.0` branch by running `bin/generate-gh-pages.sh`

## Testing

Tests are run using the Web Component Tester

```sh
npm test
```

## Rebuilding

This component is called by:

* uqlibrary-reusable-components
* uqlibrary-mylibrary
* uqlibrary-pages

These will need to be rebuilt in codeship to push this change live.
