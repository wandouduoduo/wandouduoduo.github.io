const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    audio: [
	   {
        name: "还有多少个十年",
        artist: '沈宁',
        url: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/audio/%E8%BF%98%E6%9C%89%E5%A4%9A%E5%B0%91%E4%B8%AA%E5%8D%81%E5%B9%B4.mp3',
        cover: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/images/%E8%BF%98%E6%9C%89%E5%A4%9A%E5%B0%91%E4%B8%AA%E5%8D%81%E5%B9%B4.jpg',
      },
      {
        name: '麻雀',
        artist: '李荣浩',
        url: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/audio/%E9%BA%BB%E9%9B%80.mp3',
        cover: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/images/%E9%BA%BB%E9%9B%80.jpg',
      },
      {
        name: '我们的时光',
        artist: '赵雷',
        url: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/audio/我们的时光.mp3',
        cover: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/images/我们的时光.jpg',
      },
      {
        name: '用力活着',
        artist: '公孙文',
        url: 'http://music.163.com/song/media/outer/url?id=1490914127.mp3',
        cover: 'http://p4.music.126.net/Dr4KJ_0uK0GZcKa_HQsBOQ==/109951165406186188.jpg?param=300x300',
      }
    ]
});