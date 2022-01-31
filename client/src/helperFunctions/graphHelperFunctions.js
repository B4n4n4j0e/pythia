/**
* Adds or removes filter
*/
export function handleFilterClick(vm, filter) {
  if (!vm.$store.getters['hasFilter'](vm.data.name)) {
    return
  }
  var data = {
    type: vm.data.filterType,
    filter: filter.name,
  };
  if (data.type.endsWith("Port")) {
    var filterExist = false;
    for (var [, value] of vm.filterSet.entries()) {
      var portNumber = filter.name.split("/");
      if (value == portNumber[0] || value == filter.name) {
        var newData = {
          type: vm.data.filterType,
          filter: value,
        };
        vm.$store.dispatch("removeFilterByFilterName", newData);
        vm.$store.dispatch("removeAllNegativeFilters");
        filterExist = true;
      }
    }
    if (!filterExist) {
      vm.$store.dispatch("addFilter", data);
    }
  } else {
    if (
      vm.filterSet.has(filter.name) ||
      (vm.negativeFilterSet.size > 0 &&
        !vm.negativeFilterSet.has(filter.name))
    ) {
      vm.$store.dispatch("removeFilterByFilterName", data);
      vm.$store.dispatch("removeAllNegativeFilters");
    } else {
      vm.$store.dispatch("addFilter", data);
    }
  }
}
/**
* Checks if the value is in filter or negative filter
*/
export function isFiltered(d, vm) {
  if (!vm.$store.getters['hasFilter'](vm.data.name)) {
    return false
  }
  if (vm.data.filterType.endsWith("Port")) {
    var portNumber = d.name.split("/");
    for (var [, value] of vm.filterSet.entries()) {
      if (value == portNumber[0] || value == d.name) {
        return true;
      }
    }
    if (vm.negativeFilterSet.size > 0) {
      for ([, value] of vm.negativeFilterSet.entries()) {
        if (value == portNumber[0] || value == d.name) {
          return false;
        }
      }
      return true
    }
    return false;
  } else {
    if (
      vm.filterSet.has(d.name) ||
      (vm.negativeFilterSet.size > 0 &&
        !vm.negativeFilterSet.has(d.name))
    ) {
      return true;
    }
  }
  return false;
}

/**
* Formats big numbers for shorter representation
*/
export function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}