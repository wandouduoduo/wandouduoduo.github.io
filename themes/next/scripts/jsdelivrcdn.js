'use strict';
var cheerio = require('cheerio');

//data https://hexo.io/zh-cn/docs/variables
hexo.extend.filter.register('after_post_render', function(data){
  var config = hexo.config;
  if(config.post_asset_folder){
    var link = data.permalink;
	  // console.log("页面的完整网址:"+ link);
	
  if(link.indexOf('articles') == -1) {
   return;
  }

	//page.content	页面的完整内容	string
	//page.excerpt	页面摘要	string
	//page.more	除了页面摘要的其余内容
  var toprocess = ['excerpt', 'more', 'content'];
  for(var i = 0; i < toprocess.length; i++){
    var key = toprocess[i];

    // console.log("处理页面的 " + key + "部分");
  
    var $ = cheerio.load(data[key], {
      ignoreWhitespace: false,
      xmlMode: false,
      lowerCaseTags: false,
      decodeEntities: false
    });
   //替换img内的标签
   //观察生成的post.content中img，有下面两种
   //在post中写的img标签，有高度宽度。<img width="600px" data-src="/raspberrypi/raspberrypi-summary/sumup1.png">
   //在post中写的{% asset_img bg-1.png %}标签。<img data-src="/hexo/next-theme-custom-background-img-using-unsplash/bg-1.png">
    $('img').each(function(){
      if($(this).attr('src')){
        //注意文章内容包含`var toprocess = ['excerpt', 'more', 'content']`，
        //不同内容里面的图片链接并不是一样的，有的是src，有的是data-src。
        // For windows style path, we replace '\' to '/'.
        var src = ($(this).attr('src')).replace('\\', '/');
	      // console.log("找到的img链接 "+src);

	      //src去除前后空格
	      src = src.replace(/(^\s*)|(\s*$)/g, "");
	  
	      //开始是/，以gif/png等结尾
        if(/^\/.*\.(gif|png|jpg|bmp|jpeg)$/i.test(src)) {
		      // console.log("测试img链接通过 "+src);
          $(this).attr('src', "https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@master" + src);
          // console.log("替换img链接为 " + "https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io" + src);
        }else{
		     console.info&&console.info("注意，这个img标签，data-src没有通过测试");  
	      }
      }else{
          console.info&&console.info("注意，这个img标签，没有data-src属性，或者src属性");
          console.info&&console.info($(this));
      }
    });
    data[key] = $.html();
  }}
});