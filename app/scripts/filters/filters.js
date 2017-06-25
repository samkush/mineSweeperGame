(function () {
  'use strict';
  angular.module('Filters', [])

  .filter('metric', [ function() {
   return function(number, array, type){
     var opt = number;
     if(Math.abs(number) < 1000 && type ==='Currency'){
       opt = array ? [number === 1 ? 0 : number, ''] : number === 1 ? 0 : number + '';
     }else{
       opt = array ? [(number/1000), 'm'] : (number/1000) + 'm';
     }
     return opt; //thousand
   };
 }])
 .filter('words', function () {
     return function (input, words) {
         if (isNaN(words)) {
             return input;
         }
         if (words <= 0) {
             return '';
         }
         if (input) {
             var inputWords = input.split(/\s+/);
             if (inputWords.length > words) {
                 input = inputWords.slice(0, words).join(' ') + '\u2026';
             }
         }
         return input;
   };
 })
  .filter('format',          //used from https://gist.github.com/timgit/7bc5896f5297301afb02
  function($filter) {
    return function(input, total) {
      if( total === 'percent' && input){
        return input = $filter('number')(input, 0) + '%';
      } else {
        return input = $filter('number')(0, 0) + '%';
      }
      if( total === 'currency' && input != null ){
          return input = '$' + $filter('megaNumber')(input);
      } else {
        return input = '$' + $filter('megaNumber')(0);
      }
      return input;
    };
  })
  .filter('percentageTable', ['$filter', function ($filter) {
    return function (input, decimals) {
      decimals = decimals || 0;
      return (input!=undefined || input!=null)
              ?
                  $filter('number')(input * 100, decimals) + '%'
              :
                  '-';
    };
  }])
//   .filter('dynamicFilter', function($filter) {
//   return function(value, filterName, decimals, format) {
//
//     if(value === null) {
//       return '-';
//     }
//     if(value === 'number'){
//       return $filter(filterName)(value,0);
//     }
//     if( filterName === 'currency' ){
//       return $filter(filterName)(value, '$', 0);
//     }
//     if( filterName === 'megaNumber' ){
//       return ($filter(filterName)(value, 0) != null  ? '$' + $filter(filterName)(value, 0) : '-');
//     }
//     if( filterName === 'percentage' ){
//       return $filter('percentageTable')((value/100), 0);
//     }
//     if( filterName === 'ratioToPercent' ){
//       return $filter('number')(value * 100, decimals) + '%';
//     }
//     if( filterName === 'date' ){
//       return ($filter('dateCustom')(value, 0));
//     }
//     return $filter(filterName)(value, decimals);
//   };
// })
.filter('dynamicFilter', function($filter) {
  return function(value, filterName, decimals, format) {
    if(value === null) {
      return '-';
    }
    if(!filterName){
      return (value == 0 || value) ? value : '-';
    }
    if(filterName === 'number'){
      return $filter(filterName)(value, 0);
    }
    if(filterName === 'decimal_number'){
      return $filter('number')(value, 2);
    }
    if( filterName === 'currency' ){
      return $filter(filterName)(value, '$', 0);
    }
    if( filterName === 'megaNumber' ){
      return ($filter(filterName)(value, 0) != null  ? '$' + $filter(filterName)(value, 0) : '-');
    }
    if( filterName === 'percentage' ){
      return $filter('percentageTable')((value/100), 0);
    }
    if( filterName === 'ratioToPercent' ){
      return $filter('number')(value * 100, decimals) + '%';
    }
    if( filterName === 'date' ){
      return ($filter('dateCustom')(value, 0));
    }
    if( filterName === 'boolean' ){
      if(value){
        return 'Yes';
      } else {
        return 'No';
      }
    }
    return $filter(filterName)(value, decimals);
  };
})
  .filter('megaNumber', function() {
    return function(number, fractionSize) {
        if(number === null) {
          return null;
        }
        if(number === 0) {
          return '0';
        }
        if(!fractionSize || fractionSize < 0) {
            fractionSize = 1;
        }
        var abs = Math.abs(number);
        var rounder = Math.pow(10,fractionSize);
        var isNegative = number < 0;
        var key = '';
        var powers = [
            {key: 'Q', value: Math.pow(10,15)},
            {key: 'T', value: Math.pow(10,12)},
            {key: 'B', value: Math.pow(10,9)},
            {key: 'M', value: Math.pow(10,6)},
            {key: 'K', value: 1000}
        ];

        for(var i = 0; i < powers.length; i++) {

            var reduced = abs / powers[i].value;

            reduced = Math.round(reduced * rounder) / rounder;

            if(reduced >= 1){
                abs = reduced;
                key = powers[i].key;
                break;
            }
        }

        return (isNegative ? '-' : '') + abs + key;
    };
  })

  .filter('word', [function() {
    return function(string, index) {
      if(!string) {return '' ;}
      index--;
      var arr = string.split(' ');
      return arr[index] ? arr[index] : '' ;
    };
  }])

  .filter('capitalizeFirst', function() {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
      }
  })

  .filter('setFraction', [ function() {
   return function(number, decimalPoints){
     return number && number.toFixed( decimalPoints ); //thousand
   };
 }])

//  .filter('date', function($filter)
// {
//  return function(input)
//  {
//   if(input == null){ return ""; }
//
//   if( input=='dd mm yyyy' )
//   {
//    var _date = $filter('date')(new Date(input), 'MMM dd yyyy');
//   }
//   else {
//     var _date = $filter('date')(new Date(input), 'MM dd yyyy');
//   }
//
//   return _date.toUpperCase();
//
//  };
// })

// .filter('moment', function () {
//   return function (input, momentFn /*, param1, param2, ...param n */) {
//     var args = Array.prototype.slice.call(arguments, 2),
//         momentObj = moment(input);
//     return momentObj[momentFn].apply(momentObj, args);
//   };
// });

// .filter('date', function($filter)
// {
//  return function(input)
//  {
//   if(input == null){ return ""; }
//
//   var _date = $filter('date')(new Date(input), 'MMM dd yyyy');
//
//   return _date.toUpperCase();
//
//  };
// })

// .filter('formatDateTime', function ($filter) {
//     return function (date, format) {
//         if (date) {
//             return moment(Number(date)).format(format || "DD/MM/YYYY h:mm A");
//         }
//         else
//             return "";
//     };
// });
//


 // .filter('date', [ function(){
 //   return function(date, decimalPoints){
 //     return (new Date(date)).getDate();
 //   }
 // }])

 .filter('dateCustom', function($filter)
 {
  return function(input)
  {
   if(input == null){ return ""; }
   var _date = $filter('date')(new Date(input), 'MM/dd/yyyy');
   return _date.toUpperCase();
 };
})
.filter("trust", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
}]);
// .filter('myDateFormat', function myDateFormat($filter){
//   return function(text){
//     var  tempdate= new Date(text.replace(/-/g,"/"));
//     return $filter('date')(tempdate, "MMM-dd-yyyy");
//   }
// });





}());
