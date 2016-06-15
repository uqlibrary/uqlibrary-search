# uqlibrary-search

uqlibrary-search is a search form for UQ Library

Full documentation can be found at [GitHub Pages](http://uqlibrary.github.io/uqlibrary-search).

## primo branch
TODO: this branch required uqlibrary-api#primo - release uqlibrary-api#primo first 

### Getting Started
Install Node.JS and run the following oneliner in the project directory:
```sh
npm install -g bower && bower install
```

### Developing
- Please adhere to the Polymer code style guide provided at [Style Guide](http://polymerelements.github.io/style-guide/). 
- Colors and common styles are imported (bower install) from [uqlibrary-styles](http://github.com/uqlibrary/uqlibrary-styles).
- GitHub pages should be updated after every commit to Master by running the "generate-gh-pages.sh" in the /bin/ directory

### Testing
Tests are run using the Web Component Tester. Either navigate to /tests/index.html in a browser or using the command line:
```sh
wct --local all
```