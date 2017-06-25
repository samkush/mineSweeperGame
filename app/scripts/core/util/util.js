(function () {
  'use strict';

  angular.module('UtilModule', [])
  .factory('Util', ['$rootScope', '$cookieStore', '$location', '$filter', function($rootScope, $cookieStore, $location, $filter) {
    //
    // moment.locale('en', {
    //   week : {
    //     dow : 6, // Saturday is the first day of the week.
    //   }
    // });

    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
      };
    }

    if(typeof String.prototype.trim !== 'function') {
      String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
      }
    }


    return {
      pluckOnly : function(object, keys){
        var _object = {};
        for (var key in object) {
          if (object.hasOwnProperty(key) && keys.indexOf(key) !== -1 ) {
            _object[key] = object[key];
          }
        }
        return _object;
      },
      apiUrl : function( url ){
        return url.replace(/^api:\/\//gi, $rootScope.config.api.url);
      },
      isValidJson : function(str) {
        try {
          JSON.parse(str);
        } catch (e) {
          return { valid : false, message : e};
        }
        return { valid : true, message : 'Valid Json'};
      },
      notBlank : function(v){
        return v !== '' && v !== undefined && v !== null;
      },
      trim : function(v){
        return v.trim();
      },
      chunk : function(object, chunks) {
        var _chunk = function( a, n ) {
          if ( !a.length ) {
            return [];
          }
          return [ a.slice( 0, n ) ].concat( _chunk( a.slice(n), n) );
        };
        return _chunk( _.toArray(object), chunks );
      },
      getDiff: function(val1, val2) {

        var data = {
          value: (val1 - val2)
        };

        return data;
      },
      isBetween : function( val, min, max ){
        return Boolean(val >= min && val <= max);
      },
      getIndicator: function(val) {
        return val < 0 ? 'fall' : val ? 'growth' : '';
      },
      getPer: function(val1, val2) {
        return val1 && val2 ? ( ( val1 / val2 ) * 100) : null;
      },
      clearTime : function(date){
        return moment(date).startOf('day').format('YYYY-MM-DD HH:mm:ss');
      },
      addZero : function( i ){
        if (i < 10) {
          i = '0' + i;
        }
        return i;
      },
      pastYear : function( currentDate , days ){
        days = days || 1; // Default Yesterday
        currentDate = currentDate || new Date();
        return this.clearTime( moment( currentDate ).subtract(days, 'y').toDate() );
      },
      pastDate : function( currentDate, days, measure){
        days = days || 1; // Default Yesterday
        currentDate = currentDate || new Date();
        measure = measure || 'y';
        return this.clearTime( moment( currentDate ).subtract(days, measure).toDate() );
      },
      postDay : function( currentDate , days ){
        days = days || 1; // Default Yesterday
        currentDate = currentDate || new Date();
        return this.clearTime( moment( currentDate ).add(days, 'd').toDate() );
      },
      postYear : function( currentDate , days ){
        days = days || 1; // Default Yesterday
        currentDate = currentDate || new Date();
        return this.clearTime( moment( currentDate ).add(days, 'y').toDate() );
      },
      stringStartsWith : function(string, prefix) {
          return string.slice(0, prefix.length) == prefix;
      },
      splitString : function( word, separator, limit ){
        if(limit){
          return word.split(separator, limit);
        }else{
          return word.split(separator);
        }
      },
      slugify : function (text, replace){
        replace = replace || '_';
        return text
          .toString()
          .toLowerCase()
          // .replace(/\s+/g, replace)           // Replace spaces with -
          .replace(/[^\w\-]+/g, replace)       // Remove all non-word chars
          .replace(new RegExp(''+replace+'+', 'g'), replace)       // Remove all non-word chars
          // .replace(/\-\-+/g, replace)         // Replace multiple - with single -
          // .replace(/^-+/, '')             // Trim - from start of text
          // .replace(/-+$/, '');            // Trim - from end of text
      },
      idGenerator : function(){
        this.length = 8;
        this.timestamp = +new Date();

        var _getRandomInt = function( min, max ) {
          return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
        };

        this.generate = function() {
          var ts = this.timestamp.toString();
          var parts = ts.split( '' ).reverse();
          var id = '';

          for( var i = 0; i < this.length; ++i ) {
            var index = _getRandomInt( 0, parts.length - 1 );
            id += parts[index];
          }

          return id;
        };

      },
      remarksIdGenerator: function(opt) {
        var key = '';
        for( var i in opt ){
          if( opt.hasOwnProperty( i ) ){
            key += i + opt[i];
          }
        }

        return key.toUpperCase();
      },
      truncateFileName : function( name, len ){
        var ext = name.substring(name.lastIndexOf('.') + 1, name.length).toLowerCase();
        var filename = name.replace('.'+ext,'');
        if(filename.length <= len) {
          return name;
        }
        filename = filename.substr(0, len) + (name.length > len ? '...' : '');
        return filename + '.' + ext;
      },
      queryStringToHash : function(query) {
        var query_string = {};
        query = query;
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
          var pair = vars[i].split("=");
          pair[0] = decodeURIComponent(pair[0]);
          pair[1] = decodeURIComponent(pair[1]);
          	// If first entry with this name
          if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
          	// If second entry with this name
          } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]], pair[1] ];
            query_string[pair[0]] = arr;
          	// If third or later entry with this name
          } else {
            query_string[pair[0]].push(pair[1]);
          }
        }
        return query_string;
      },
      PlantQ : function( q ){
        var q = this.queryStringToHash( q );
        _.each(q, function(p, k){
          q[k] = p.split(',');
          _.map(q[k], function(obj){
            return obj.trim();
          })
        });
        return q;
      },
      percent : function(n, d){
        return n && d ? Math.round((n / d) * 100) : 0;
      },
      isEmptyObj : function(obj){
        return _.isEmpty(obj);
      },
      graphInitFunc : function(){
        var $$ = this;
        $$.getYForText = function (points, d, textElement) {
          var $$ = this,
          box = textElement.getBoundingClientRect(),
          yPos;
          if ($$.config.axis_rotated) {
            yPos = (points[0][0] + points[2][0] + box.height * 0.6) / 2;
          } else {
            yPos = ((points[3][1] + points[2][1])/2) + (box.height/2) - 2;
          }
          // show labels regardless of the domain if value is null
          if (d.value === null && !$$.config.axis_rotated) {
            if (yPos < box.height) {
              yPos = box.height;
            } else if (yPos > this.height) {
              yPos = this.height - 4;
            }
          }
          return yPos;
        };
      },
      // getWeekwiseDate : function(minDate, currentDate){
      //   var currentDate = moment(currentDate).endOf('week').add(1,'d');
      //   var data = [];
      //   minDate = moment(minDate);
      //   // console.log('minDate',moment().format('LLLL').split(' ').slice(0, 4).join(' '));
      //   for (;minDate.isBefore(currentDate);) {
      //     data.push({
      //       name : minDate.startOf('week').format("LLLL").split(' ').slice(0, 4).join(' ') + ' - ' + minDate.endOf('week').format("LLLL").split(' ').slice(0, 4).join(' '),
      //       // value : minDate.clone().endOf('week').endOf('d').format("YYYY-MM-DD HH:mm:ss"),
      //       value : minDate.clone().endOf('week').endOf('d').format("YYYY-MM-DD HH:mm:ss"),
      //       weekNumber: minDate.week(),
      //     });
      //     minDate = minDate.add(1, 'w');
      //   }
      //   return angular.copy( data );
      // },
      getWeekwiseDate : function(minDate, currentDate){
        var currentDate = moment(currentDate).endOf('week').add(1,'d');
        var data = [];
        minDate = moment(minDate);
        // console.log('minDate',moment().format('LLLL').split(' ').slice(0, 4).join(' '));
        // console.log('chek start',minDate.clone().startOf('week').startOf('d').format("YYYY-MM-DD HH:mm:ss"));
        // console.log('chek end of week',minDate.clone().endOf('week').endOf('d').format("YYYY-MM-DD HH:mm:ss"));
        for (;minDate.isBefore(currentDate);) {
          data.push({
            name : minDate.startOf('week').format("LLLL").split(' ').slice(0, 4).join(' ') + ' - ' + minDate.endOf('week').format("LLLL").split(' ').slice(0, 4).join(' '),
            // value : minDate.clone().endOf('week').endOf('d').format("YYYY-MM-DD HH:mm:ss"),
            endOfWeekValue : minDate.clone().endOf('week').endOf('d').format("YYYY-MM-DD HH:mm:ss"),
            startWeekValue : minDate.clone().startOf('week').startOf('d').format("YYYY-MM-DD HH:mm:ss"),
            weekNumber: minDate.week(),
          });
          minDate = minDate.add(1, 'w');
        }
        return angular.copy( data );
      },
      manipulateDate : function(number, measure, opt, date, minDate){
        var previousDate = angular.copy(date);
        switch ( opt ) {
          case 'previous':
            date = moment(date).subtract(number, measure).toDate();
            if(date < minDate){
              date = moment(minDate).toDate();
            }
          break;
          case 'today':
            date = moment().toDate();
            $rootScope.todaysDate = new Date();
          break;
          case 'next':
            if( moment(new Date(date)).isBefore(moment().toDate())){
              date = moment(date).add(number, measure).toDate();
              if(date > new Date()){
                date = previousDate;
              }
            }
          break;
          default:
          break;
        }
        return date;
      },
      group_reduce_multiple_keys: function(source, groups, keys, memo){
        function group(src, i){
          // reduce = reduce || function(memo, num){ return memo + num; };
          memo = memo || 0;
          if( i < groups.length ){
            src = _.groupBy(src, groups[i]);
            src = src.undefined ? null : src;
            src = _.mapObject(src, function(v, key){
              var sum_obj = {};
              sum_obj[groups[i]] = key;
              if( i == groups.length-1 ){
                for (var k in keys) {
                    sum_obj[keys[k]] = _.reduce(v, function(memo, num){ return memo = memo + parseInt(num[keys[k]] || 0) }, 0);
                }
              } else {
                v = group(v, i+1);
              }
              return sum_obj;
            });
          }
          return src;
        }
        return group(source, 0);
      },
      groupReduce: function(source, groups, reduce, memo){
        function group(src, i){
          reduce = reduce || function(memo, num){ return memo + num; };
          memo = memo || 0;
          if( i < groups.length ){
            src = _.groupBy(src, groups[i]);
            src = src.undefined ? null : src;
            src = _.mapObject(src, function(v){
              if( i == groups.length-1 ){
                v = _.reduce(v, reduce, memo);
              } else {
                v = group(v, i+1);
              }
              return v;
            });
          }
          return src;
        }
        return group(source, 0);
      },
      get_pivot_table_total : function(keys, arr, title, type){
        type = type || 'total';
        var total = {
          type: type,
          sector: title
        };
        for (var i = 0; i < keys.length; i++) {
          total[keys[i]] = _.reduce(arr, function(memo, obj){ return memo + parseFloat( obj[keys[i]] ); }, 0);
        }
        return total;
      },
      get_count_sum_avg: function(arr){
        var obj = {};
        obj.cnt = arr.length;
        arr = arr.filter(function (x) { return Boolean(x) && !isNaN(x); });
        obj.sum = _.reduce(arr, function(memo, num){ return memo + parseFloat(num); }, 0);
        obj.avg = $filter('number')(( obj.sum / obj.cnt), 2);
        obj.sum = $filter('number')(obj.sum, 0);
        var max = Math.max.apply(Math, arr);
        var min = Math.min.apply(Math, arr);
        obj.max = isFinite(max) ? $filter('number')(max, 0) : 0;
        obj.min = isFinite(min) ? $filter('number')(min, 0) : 0;
        return obj;
      },
      findIndexInData: function(data, property, value){
        var result = -1;
        data.some(function (item, i) {
            if (item[property] === value) {
                result = i;
                return true;
            }
        });
        return result;
      },
      getQueryParameter: function(parameter, defaultValue){
        return $location.$$search[parameter] || $cookieStore.get('_' + $rootScope.config.prefix + parameter) || defaultValue;
      },
      getCookieParameter: function(parameter, defaultValue){
        return $cookieStore.get('_'+ $rootScope.config.prefix + parameter) || defaultValue; // last option removed by vallabh on 11/7/2016
      },
      storeQueryParameter: function(query, parameter){
        if( query ) {
          if( $location.$$search[parameter] !== query ){
            $cookieStore.put('_' + $rootScope.config.prefix + parameter, query);
            $location.search(parameter, query);
          }
        } else {
          $cookieStore.put('_'+ $rootScope.config.prefix  + parameter, null);
          if( $location.$$search[parameter] ){
            $location.search(parameter, null);
          }
        }
      },
      storeCookieParameter: function(query, parameter){
        if( query ) {
          if( $cookieStore[parameter] !== query ){
            $cookieStore.put('_' + $rootScope.config.prefix + parameter, query);
          }
        } else {
          if( $cookieStore[parameter] ){
            $cookieStore.put('_'+ $rootScope.config.prefix + parameter, null);
          }
        }
      },
      remove_null_keys : function(obj){
        for (var i in obj) {
          if (obj[i] === null || obj[i] === undefined) {
          // test[i] === undefined is probably not very useful here
            delete obj[i];
          }
        }
        return obj;
      },
      getProjectNameList : function(){
        var meeting = [
          { 'code' : 'project_1', 'name' : 'eAP Project1'},
          { 'code' : 'project_2', 'name' : 'eAP Project2'},
          { 'code' : 'project_3', 'name' : 'eAP Project3'},
          { 'code' : 'project_4', 'name' : 'eAP Project4'}

        ];
        return meeting;
      },
      getActivityNameList : function(){
        var meeting = [
          { 'code' : 'activity_1', 'name' : 'Development'},
          { 'code' : 'activity_2', 'name' : 'Recruitment'},
          { 'code' : 'activity_3', 'name' : 'Training'},
          { 'code' : 'activity_4', 'name' : 'Research'},
          { 'code' : 'activity_5', 'name' : 'Project Management'},
          { 'code' : 'activity_6', 'name' : 'Meeting Client'}

        ];
        return meeting;
      },
      insertAtCaret: function(areaId, text){
        var txtarea = document.getElementById(areaId);
        if (!txtarea) { return; }

        var scrollPos = txtarea.scrollTop;
        var strPos = 0;
        var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
          "ff" : (document.selection ? "ie" : false ) );
        if (br == "ie") {
          txtarea.focus();
          var range = document.selection.createRange();
          range.moveStart ('character', -txtarea.value.length);
          strPos = range.text.length;
        } else if (br == "ff") {
          strPos = txtarea.selectionStart;
        }

        var front = (txtarea.value).substring(0, strPos);
        var back = (txtarea.value).substring(strPos, txtarea.value.length);
        txtarea.value = front + text + back;
        strPos = strPos + text.length;
        if (br == "ie") {
          txtarea.focus();
          var ieRange = document.selection.createRange();
          ieRange.moveStart ('character', -txtarea.value.length);
          ieRange.moveStart ('character', strPos);
          ieRange.moveEnd ('character', 0);
          ieRange.select();
        } else if (br == "ff") {
          txtarea.selectionStart = strPos;
          txtarea.selectionEnd = strPos;
          txtarea.focus();
        }
        txtarea.scrollTop = scrollPos;
      }
    };
  }]);

}());
