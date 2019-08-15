(function () {
  Polymer({
    is: 'uqlibrary-autosuggest-input',

    properties: {

      /**
       * Search keyword
       */
      keyword: {
        type: String,
        observer: '_keywordChanged',
        notify: true
      },

      /**
       * Search input field label
       */
      label: {
        type: String
      },

      /**
       * Object field to use for displayed text
       */
      itemLabel: {
        value: 'name',
        type: String
      },

      /**
       * Enable autosuggest
       */
      enableAutosuggest: {
        type: Object,
        value: true
      },

      /**
       * List of suggestions to display
       */
      suggestions: {
        type: Array,
        observer: '_suggestionsChanged'
      },

      /**
       * Selected suggestion, set when user selects a suggestion
       */
      selectedSuggestion: {
        type: Object,
        value: null
      },

      /**
       * Disable floating label on input field
       */
      noLabelFloat: {
        type: Object,
        observer: '_noLabelFloatChanged'
      },

      _inputKeywordTarget: {
        type: Object,
        value: function () {
          return this.$.inputKeyword;
        }
      },

      _suggestionsTarget: {
        type: Object,
        value: function() {
          return this.$.listSuggestions;
        }
      },
      _selectedIndex: { // for on-tap and on-iron-activate to work when theres only one item
        type: Number,
        value: 0
      }
    },
    _keywordFocused: function() {
      this.selectedSuggestion = null;
      if (!this.enableAutosuggest || this.keyword.length <= 2) {
        this.$.menuSuggestions.close();
      } else if (this.suggestions && this.suggestions.length > 0) {
        this.$.menuSuggestions.open();
        this.fire('focus');
      }
    },

    _keywordChanged: function(newValue, oldValue) {
      // this.selectedSuggestion = null;
      if (!this.enableAutosuggest || this.keyword.length <= 2) {
        this.$.menuSuggestions.close();
      }
    },

    _suggestionsChanged: function () {
      this.async(function () {
        if (this.suggestions && this.suggestions.length > 0) {
          if (!this.$.menuSuggestions.opened){
            this.$.menuSuggestions.open();
            this.fire('focus');
          }
        }
        else
          this.$.menuSuggestions.close();
      }, 100);
    },

    _activated: function(e) {
      this.$.menuSuggestions.close();
      // if (suggestion && !this.selectedSuggestion) {
      //   this.selectedSuggestion = suggestion;
      // }
      this.fire('activated', this.selectedSuggestion ? this.selectedSuggestion : this.keyword);
      this.suggestions = [];
    },

    _getItemLabel: function (item) {
      item[this.itemLabel] = item[this.itemLabel].replace(/&amp;/g, '&');
      return item[this.itemLabel];
    },

    _suggestionSelected: function (e) {
      this.selectedSuggestion = this.suggestions[e.detail.selected];
      this.keyword = this.selectedSuggestion[this.itemLabel];

      this._activated();
    },

    _selectFirstItem: function (e) {
      this.async(function () {
        if (this.$.menuSuggestions.opened) {
          this.$.listSuggestions.focus();
        }
      }, 100);
    },

    _closeSuggestions: function (e) {
      this.async(function () {
        this.$.menuSuggestions.close();
      }, 100);
    },

    _recentSearchClass: function(isRecent) {
      return isRecent ? 'recent-search' : '';
    },

    /**
     * Set focus on input field
     */
    setFocus: function() {
      this.$.inputKeyword.focus();
    },

    /**
     * Removes the field value
     */
    clear: function() {
      this.$.inputKeyword.value = '';
    },

    _noLabelFloatChanged: function() {
      this.$.inputKeyword.noLabelFloat=this.noLabelFloat;

      //adjust where suggestions show up when there's no floating label
      if (this.noLabelFloat) {
        this.$.menuSuggestions.verticalOffset="33";
        this.$.menuSuggestions.horizontalOffset="0";
      }
    },

    ready: function() {

    }
  });
})();