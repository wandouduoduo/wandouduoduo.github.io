const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    audio: [
	   {
        name: "还有多少个十年",
        artist: '沈宁',
        url: 'http://m10.music.126.net/20210324114924/e705a3634a3506255f974646ca061f55/ymusic/1266/9dd9/a0a5/ff5eb332cbd8f36891c9a8e0e68e47a1.mp3',
        cover: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/images/%E8%BF%98%E6%9C%89%E5%A4%9A%E5%B0%91%E4%B8%AA%E5%8D%81%E5%B9%B4.jpg',
      },
      {
        name: '麻雀',
        artist: '李荣浩',
        url: 'http://m10.music.126.net/20210324114757/78629dc93ad5f28efc14b5b9cae82025/ymusic/555b/0f58/0609/b1e0b087cb826dde13b21cbaa504f963.mp3',
        cover: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/images/%E9%BA%BB%E9%9B%80.jpg',
      },
      {
        name: '我们的时光',
        artist: '赵雷',
        url: 'http://m10.music.126.net/20210324114959/2c3b770fae2f1c8a62803c0737420e05/ymusic/12ca/05c1/e5b7/c58c9f85a602e16983271f86f565f2e4.mp3',
        cover: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/images/我们的时光.jpg',
      },
      {
        name: '用力活着',
        artist: '张茜',
        url: 'http://music.163.com/song/media/outer/url?id=1490914127.mp3',
        cover: 'http://p4.music.126.net/Dr4KJ_0uK0GZcKa_HQsBOQ==/109951165406186188.jpg?param=300x300',
      }
    ]
});