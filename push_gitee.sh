#!/bin/bash -l
PUBLIC_WWW=/e/Blog/sunhexo
echo -e "Push wandouduoduo.gitee.io To Baidu"
cd $PUBLIC_WWW/public/
cp baidu_urls.txt urls.txt
sed -i 's/github/gitee/g' urls.txt
curl -H 'Content-Type:text/plain' --data-binary @urls.txt "http://data.zz.baidu.com/urls?site=https://wandouduoduo.gitee.io&token=FjBwPH1cgYDxPvCn"
if [[ $? == 0 ]]
then
    echo "Success! Push Finish!!"
else
    echo "Fail! Please Check"
fi

#更新gitee  map
echo -e "update gitee baidusitemap"
cp baidusitemap.xml  giteebaidusitemap.xml
sed -i 's/github/gitee/g' giteebaidusitemap.xml

echo -e "update gitee  sitemap"
cp sitemap.xml  giteesitemap.xml
sed -i 's/github/gitee/g' giteesitemap.xml
