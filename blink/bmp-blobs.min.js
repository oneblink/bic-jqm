!function(a){"use strict";var b,c=(a.BMP,{}),d={};c.createObjectURL=function(a,c){var e=b();
return!(!c||!c.autoRevoke)||!1,d[e]=a,"blob:"+e},c.revokeObjectURL=function(a){var b=a.replace("blob:","");
delete d[b]},c.retrieveObject=function(a){var b=a.replace("blob:","");return d[b]
},c.revokeAllObjectURLs=function(){d={}},b=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=0|16*Math.random(),c="x"===a?b:8|3&b;
return c.toString(16)})},a.BMP=a.BMP||{},a.BMP.URL=c}(this),function(a){"use strict";
var b,c;a.BMP=a.BMP||{},b=a.BMP,b.MIME=b.MIME||{},c=b.MIME,c.TEXT_TYPES=["application/javascript","application/json","application/x-javascript"],c.isText=function(a){return 0===a.indexOf("text/")?!0:-1!==c.TEXT_TYPES.indexOf(a)?!0:!1
}}(this),function(a){"use strict";var b,c,d,e=!0,f=a.BMP.MIME;try{b=new a.Blob,b=null
}catch(g){e=!1}d=function(b){var c,d="",e=new a.Uint8Array(b),f=e.byteLength;for(c=0;f>c;c++)d+=String.fromCharCode(e[c]);
return a.btoa(d)},c=function(a,b){var c;if(a&&!Array.isArray(a))throw new Error("first argument should be an Array");
return b=b||{},this.size=0,this.type="",this.base64="",this.text="","object"==typeof b&&(this.type=b.type||this.type),a&&a.length&&(c=a[0],"string"==typeof c&&(0===c.indexOf("data:")&&"text/plain"===this.type?(this.size+=c.length,this.text+=c):(this.size+=c.length,this.base64+=c))),this
},c.createNative=function(b,d){var f;return d=d||{},e?new a.Blob(b,d):a.BlobBuilder?(f=new a.BlobBuilder,f.append(b),f.getBlob(d)):new c(b,d)
},c.fromBlobURL=function(b,d,e){d=d||function(){},e=e||function(){},a.URL&&a.URL.createObjectURL?c.nativelyFromBlobURL(b,d,e):this.fromNativeBlob(a.BMP.URL.retrieveObject(b),function(a){d(a)
},function(a){e(a)})},c.fromNativeBlob=function(b,d,e){var f=new a.FileReader;d=d||function(){},e=e||function(){},f.onload=function(a){var g;
f.onload=null;try{if(g=a.target.result,b=c.fromDataURI(a.target.result),!b)throw new Error("Blob.fromNativeBlob: fromDataURI gave no blob")
}catch(h){return e(h),void 0}d(b)},f.onerror=function(a){f.onerror=null,e(a.target.error)
};try{f.readAsDataURL(b)}catch(g){f.onload=null,f.onerror=null,e(g)}},c.fromDataURI=function(a){var b,d,e,f,g=new c;
return b=a.split(","),f=b[1],b=b[0].split(":"),b=b[1].split(";"),d=b[0],e=b[1],"base64"===e?g.base64=f:g.text=f,g.type=d,g.size=f.length,g
},c.prototype.toDataURI=function(){var a,b;return a="data:"+this.type,this.base64?(a+=";base64,",b=a+this.base64):(a+=",",b=a+this.text),b
},c.nativelyFromBlobURL=function(b,e,f){var g,h;e=e||function(){},f=f||function(){},g=new a.XMLHttpRequest,g.onreadystatechange=function(){var b,g,i;
this.readyState===a.XMLHttpRequest.DONE&&(this.onreadystatechange=null,b=this.getResponseHeader("Content-Type"),200===this.status?("arraybuffer"===this.responseType?(g=d(this.response),h=new c([g],{type:b})):"blob"===this.responseType?c.fromNativeBlob(this.response,function(a){e(a)
},function(a){f(a)}):"document"===this.responseType?(i=new a.XMLSerializer,g=a.btoa(i.serializeToString(this.response)),h=new c([g],{type:b})):"json"===this.responseType?(g=a.btoa(JSON.stringify(this.response)),h=new c([g],{type:b})):h=new c([this.response],{type:b}),h?e(h):f(new Error("error retrieving target Blob via Blob URL"))):f(new Error(this.url+" -> "+this.status)))
},g.open("GET",b),g.send()},c.isNested=function(){},c.prototype.decode64=function(){!this.text&&this.base64&&f.isText(this.type)&&(this.text=a.atob(this.base64),this.base64=null)
},c.prototype.encode64=function(){this.text&&!this.base64&&(this.base64=a.btoa(this.text),this.text=null)
},c.prototype.makeNested=function(){var a="data:";a+=this.type,a+=";base64,",a+=this.base64,this.type="text/plain",this.text=a,this.base64=null
},c.prototype.undoNested=function(){var a=c.fromDataURI(this.text);this.type=a.type,this.base64=a.base64,this.text=null
},c.prototype.toNative=function(){return a.BMP.Blob.createNative([a.atob(this.base64)],{type:this.type})
},a.BMP=a.BMP||{},a.BMP.Blob=c}(this),function(a){"use strict";var b,c;a.BMP=a.BMP||{},b=a.BMP,c=function(a){if(a instanceof $&&1===a.length)this.$el=a,this.el=this.$el[0];
else{if(!_.isElement(a))throw new Error("BMP.FileInput constructor expects a single DOM Element");
this.el=a,this.$el=$(this.el)}return this},c.prototype.size=function(){return this.el&&this.$el.val()&&this.el.files?this.el.files.length:0
},c.prototype.getNativeBlob=function(a){var b;if(a&&_.isNumber(a)||(a=0),b=this.size(),a>=b)throw new RangeError("targetIndex: "+a+"; size:"+b);
return this.el.files[a]},c.prototype.getBlob=function(a){var c=new $.Deferred;return b.Blob.fromNativeBlob(this.getNativeBlob(a),function(a){c.resolve(a)
},c.reject),c.promise()},c.initialize=function(){$(document.body).on("click","input[type=file]",c.onClick)
},c.onClick=function(){var a=$(this);a.data("fileInput")||a.data("fileInput",new c(this))
},b.FileInput=c}(this);
/*
//@ sourceMappingURL=bmp-blobs.js.map
*/