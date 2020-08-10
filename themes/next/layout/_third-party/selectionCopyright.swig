<style>
#selectionCopyright {
    position: absolute;
    display: none;
    background: rgba(244,67,54,.7);
    color: #fff;
    border-radius: 6px;
    box-shadow: none;
    border: none;
    font-size: 14px;
}
#selectionCopyright a{
    color:#fff;
    border-color: #fff;
}
#selectionCopyright::before {
    content: "";
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px 8px 6px 0;
    border-color: transparent rgba(244,67,54,.7) transparent transparent;
    position: absolute;
    left: -8px;
    top:50%;
    transform:translateY(-50%);
}
</style>

<button id="selectionCopyright" disabled="disabled">本文发表于[<a href="http://wandouduoduo.github.io/">豌豆多多</a>]分享请注明来源！</button>

<script>
window.onload = function() {
    function selectText() {
        if (document.selection) { //IE浏览器下
            return document.selection.createRange().text; //返回选中的文字
        } else { //非IE浏览器下
            return window.getSelection().toString(); //返回选中的文字
        }
    }
    var content = document.getElementsByTagName("body")[0];
    var scTip = document.getElementById('selectionCopyright');

    content.onmouseup = function(ev) { //设定一个onmouseup事件
        var ev = ev || window.event;
        var left = ev.clientX;//获取鼠标相对浏览器可视区域左上角水平距离距离
        var top = ev.clientY;//获取鼠标相对浏览器可视区域左上角垂直距离距离
        var xScroll = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);//获取文档水平滚动距离
        var yScroll = Math.max(document.body.scrollTop, document.documentElement.scrollTop);//获取文档垂直滚动距离
        if (selectText().length > 0) {
            setTimeout(function() { //设定一个定时器
                scTip.style.display = 'inline-block';
                scTip.style.left = left + xScroll + 15 + 'px';//鼠标当前x值
                scTip.style.top = top + yScroll - 15 + 'px';//鼠标当前y值
            }, 100);
        } else {
            scTip.style.display = 'none';
        }
    };

    content.onclick = function(ev) {
        var ev = ev || window.event;
        ev.cancelBubble = true;
    };
    document.onclick = function() {
        scTip.style.display = 'none';
    };
};
</script>