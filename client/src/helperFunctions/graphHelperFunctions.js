export function handleFilterClick(vm,filter){
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
              vm.$store.commit("removeFilterByFilterName", newData);
              vm.$store.commit("removeAllNegativeFilters");
              filterExist = true;
            }
          }
          if (!filterExist) {
            vm.$store.commit("addFilter", data);
          }
        } else {
          if (
            vm.filterSet.has(filter.name) ||
            (vm.negativeFilterSet.size > 0 &&
              !vm.negativeFilterSet.has(filter.name))
          ) {
            vm.$store.commit("removeFilterByFilterName", data);
            vm.$store.commit("removeAllNegativeFilters");
          } else {
            vm.$store.commit("addFilter", data);
          }
        }
      }
export function isFiltered(d, vm){
          if (vm.data.filterType.endsWith("Port")) {
            var portNumber = d.name.split("/");
            for (var [, value] of vm.filterSet.entries()) {
              if (value == portNumber[0] || value == d.name) {
                return true;
                  }
            }
            if (vm.negativeFilterSet.size > 0) {
               for ( [, value] of vm.negativeFilterSet.entries()) {
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