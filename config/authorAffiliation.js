function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

define(['underscore'], function (_) {
  /**
   * Take in an array of affiliations, and figure out which should be
   * selected
   *
   * @param {array} affs
   */
  var selectAffiliation = function selectAffiliation(affs) {
    // check if there are more than 1, if not just select that one
    if (affs.length > 1) {
      // check if the first entry is a (None), if so, then find the first non-(None) entry
      if (affs[0].name === '-') {
        var idx = affs.findIndex(function (a) {
          return a.name !== '-';
        });

        if (idx) {
          return [].concat(_toConsumableArray(affs.slice(0, idx)), [_objectSpread(_objectSpread({}, affs[idx]), {}, {
            selected: true
          })], _toConsumableArray(affs.slice(idx + 1)));
        }
      }
    }

    return [_objectSpread(_objectSpread({}, affs[0]), {}, {
      selected: true
    })];
  };
  /**
   * Parse and format author affiliation data
   *
   * This factory will create a new entry for the table that has an author and all
   * their corresponding affiliations and active dates.
   *
   * @param {string} author
   * @param {array} affs
   * @returns {{id: string, selected: boolean, author: *, affiliations: Array, lastActiveDates: Array}}
   */


  var authorAffiliationFactory = function authorAffiliationFactory(author, affs) {
    var out = {
      id: _.uniqueId(),
      selected: true,
      author: author,
      affiliations: [],
      lastActiveDates: []
    };
    out.affiliations = selectAffiliation(affs.map(function (a, i) {
      return {
        id: _.uniqueId(),
        selected: false,
        name: a.affiliations.name,
        years: a.affiliations.years
      };
    }));
    out.lastActiveDates = affs.map(function (a, i) {
      return {
        id: _.uniqueId(),
        selected: i === 0,
        date: a.affiliations.lastActiveDate
      };
    });
    return out;
  };

  return {
    create: authorAffiliationFactory
  };
});
