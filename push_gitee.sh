#!/bin/bash -l
PUBLIC_WWW=/e/Blog/sunhexo
echo -e "Push wandouduoduo.gitee.io To Baidu\n"
cd $PUBLIC_WWW/public/
rm -rf urls.txt
cp baidu_urls.txt urls.txt
sed -i 's/github/gitee/g' urls.txt
curl -H 'Content-Type:text/plain' --data-binary @urls.txt "http://data.zz.baidu.com/urls?site=https://wandouduoduo.gitee.io&token=FjBwPH1cgYDxPvCn"

if [[ $? == 0 ]]
then
    echo "Success! Push Finish!!"
else
    echo "Fail! Please Check"
fi
# 更新gitee
echo -e "update gitee\n"
cd $PUBLIC_WWW
python3 update_gitee.py