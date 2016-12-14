/*
*   lazyloadtree 1.0.0
*   By nobrokenboy
*   @function: to realize a lazyloader
* */
var lazyLoadTree=(function () {
    "use strict";
    /*
    * @function _hasClass: judge is the element has the className
    * @param obj
    * @param classOfName
    * */
    var _hasClass=function(obj,classOfName){
        return obj.className.match(new RegExp('(\\s|^)'+classOfName+'(\\s|$)'));
    };

    /*
    * @function _addClass: give the element add a className
    * @param obj
    * @param classOfName
    * */
    var _addClass=function(obj,classOfName){
        if(!_hasClass(obj,classOfName)){
            //必须是加空格的双引号
            obj.className+=" "+classOfName;
        }
    };

    /*
    * @function _removeClass:remove className from the element
    * @param obj
    * @param classOfName
    * */
    var _removeClass=function(obj,classOfName){
        if(_hasClass(obj,classOfName)){
            var reg=new RegExp('(\\s|^)'+classOfName+'(\\s|$)');
            obj.className=obj.className.replace(reg,"");
        }
    };

    /*
    * @function _toggleClass:toggle className from the element
    * @param obj
    * @param className
    * */
    var _toggleClass=function(obj,classOfName){
        if(_hasClass(obj,classOfName)){
            _removeClass(obj,classOfName);
        }else{
            _addClass(obj,classOfName);
        }
    };

    /*
    *  @function:change type to real Array
    * */
    var _toArr= function (items) {
        try {
            return Array.prototype.slice.call(items);
        } catch (ex) {

            var i= 0,
                len= items.length,
                result= Array(len);

            while (i < len) {
                result[i] = items[i];
                i++;
            }

            return result;
        }
    };
    /*
    * @function:judge a object is that type
    * */
    var _isType = function(type, obj) {
        //检测数组可以使用Object.prototype.toString()方法进行检测，如果是数组的话，他会返回"[object Array]",如果是对象，会返回"[object object]"
        var _class = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && _class === type;
    };

    /*
    * @function:
    * */
    var _deepExtend = function(out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];
            if (!obj)
                continue;
            for (var key in obj) {
                //检测该对象属性是不是从父类那边继承来的
                if (obj.hasOwnProperty(key)) {
                    if (_isType('Object', obj[key]) && obj[key] !== null)
                        _deepExtend(out[key], obj[key]);
                    else
                        out[key] = obj[key];
                }
            }
        }
        return out;
    };

    /*
    * @function:remove the duplicate element from the array
    * @return:a array that is not duplicate
    * */
    var _removeDuplicate=function(arr){
        var obj={},
            result=[];
        for(var i= 0,j=arr.length;i<j;i++){
            obj[arr[i]]=i;
        }
        //获取对象的key
        for(var i in obj){
            result.push(parseInt(i));
        }
        return result;
    };

    /*
    *  @function:get the min element index of the Array
    * */
    var _getMinIndex= function (array) {
        array=array||[];
        var len=array.length,
            index=0;
        if(len>0){
            if(len==1){
                return index;
            }
            //遍历对比大小
            for(var j=0;j<len;j++){
                if(array[index]>array[j]){
                    index=j;
                }
            }
            return index;

        }

    }
    /*
    * @function:add different event for a element
    * */
    var _addEventListener=function(el,type,listener,isUseCapture){
        //检测对象是否存在
        if(el===null||typeof(el)==="undefined")return;
        //默认isUseCapture 为false
        isUseCapture=isUseCapture||false;
        if(el.addEventListener){
            el.addEventListener(type,listener,isUseCapture);
        }else if(el.attachEvent){
            el.attachEvent("on"+type, function () {
                listener.apply(el);
            });
        }else{
            el["on"+type]=listener;
        }
    };

    /*
    * @function:remove event from a element
    * */
    var _removeEventListener= function (el,type,listener) {
        //检测对象是否存在
        if(el===null||typeof (el)==="undefiend")return;
        if(el.removeEventListener){
            el.removeEventListener(type,listener);
        }else if(el.detachEvent){
            el.detachEvent("on"+type, function () {
                listener.apply(el);
            });
        }else{
            el["on"+type]=null;
        }
    };
    /*
    *  @function:lazyloader
    *  @param container:wrapper of contaniner
    *  @param params:the property of lazyloader
    * */
    var lazyLoader= function (container,params) {
        var _self=this;
        //lazyloader的属性与方法
        _self.settings={
            wrapper:container,
            fakeImg:params.fakeImg,
            imgLoadingIndex:0,
            imgArr:[],
            imgLength:0,
            imgArrOffsetHeight:[],
            columnOffsetHeight:[],
            firstRowsOffsetHeight:[],
            effect:params.effect||"fadeIn",
            loaderLayer:params.loaderLayer||"",
            onInit: function () {},
            onScroll: function () {},
            onLoading:function(){}
        };


    };
    lazyLoader.prototype.init=function(hd,vd){
        var _self=this;
        //获取当前设备的宽度
        var seeWidth=document.documentElement.clientWidth;
        //获取图片加载区域的外包元素
        var wrapperEle=document.querySelector(_self.settings.wrapper);
        //获取图片的外包元素
        var imgWrapper=wrapperEle.getElementsByClassName("img-box");
        //获取加载区域的图片
        _self.settings.imgArr=wrapperEle.getElementsByTagName("img");
        //获取图片的数量
        _self.settings.imgLength=_self.settings.imgArr.length;
      /*  //遍历设置预加载的图片
        for(var i=0;i<_self.settings.imgLength;i++){
            _self.settings.imgArr[i].setAttribute("src",_self.settings.fakeImg);
        }*/

        //每一列的宽度
        var rowsWidth=imgWrapper[0].offsetWidth+hd;
        //设置每行的列数
        var columnNums=Math.floor(seeWidth/rowsWidth);
        //设置加载区域的宽度
     /*   wrapperEle.style.width=rowsWidth*columnNums-hd+"px";*/
        //图片加载完成，获取img-box的高度
        _self.settings.imgArr[_self.settings.imgLength-1].onload= function () {

           /* document.querySelector(_self.settings.loaderLayer).style.display="none";*/
            //首次懒加载
            for(var i=0;i<_self.settings.imgLength;i++){
                _self.settings.imgArrOffsetHeight.push(imgWrapper[i].offsetHeight);
            }
            //首先安排第一行
            for(var i=0;i<columnNums;i++){
                imgWrapper[i].style.top=0+"px";
                imgWrapper[i].style.left=(rowsWidth*i+hd)+"px";
                _self.settings.firstRowsOffsetHeight.push( _self.settings.imgArrOffsetHeight[i]);

            }
            //接着安排除了第一行之后的其他行
            for(var i=columnNums;i<_self.settings.imgLength;i++){
                //获取最短一列的索引值
                var minIndex=_getMinIndex(_self.settings.firstRowsOffsetHeight);
                imgWrapper[i].style.top=(_self.settings.firstRowsOffsetHeight[minIndex]+vd)+"px";
                imgWrapper[i].style.left=(rowsWidth*minIndex+hd)+"px";
                //更新最小列的高度
                _self.settings.firstRowsOffsetHeight[minIndex]=_self.settings.imgArrOffsetHeight[i]+_self.settings.firstRowsOffsetHeight[minIndex]+vd;
            }

            //设置外围父元素高度
            wrapperEle.style.height=imgWrapper[_self.settings.imgLength-1].offsetTop+"px";
            console.log(wrapperEle.style.height);

            //懒加载
            _self.loading();

        };

    };
    lazyLoader.prototype.loading=function(){
        var _self=this;
        //获取当前设备的宽度
        var seeWidth=document.documentElement.clientWidth;
        //获取图片加载区域的外包元素
        var wrapperEle=document.querySelector(_self.settings.wrapper);
        //获取图片的外包元素
        var imgWrapper=wrapperEle.getElementsByClassName("img-box");
        //获取页面的可见区域
        var seeHeight=document.documentElement.clientHeight;
        //获取滚动区域的高度
        var scrollTop=document.documentElement.scrollTop||document.body.scrollTop;
        for (var i =0; i < _self.settings.imgLength; i++) {
            if (imgWrapper[i].offsetTop < seeHeight + scrollTop) {
                console.log(imgWrapper[i].offsetTop);
                /*if (_self.settings.imgArr[i].getAttribute("src") == _self.settings.fakeImg) {
                    _self.settings.imgArr[i].src = _self.settings.imgArr[i].getAttribute("data-src");
                    //显示图片

                }*/
                _addClass(imgWrapper[i],"fadeIn");
                _self.settings.imgLoadingIndex = i + 1;
            }
        }
    };

    return {
        lazyLoader:lazyLoader
    };

})();