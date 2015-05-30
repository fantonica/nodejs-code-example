module.exports = {
    parseViewId: function(){
        var href = window.location.href;
        return href.split('/')[3] || null;
    },
    notification: function(text, settings){
      window.notify = $.notify(text, settings);
    }
}