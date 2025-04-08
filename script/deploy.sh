# ssh root@172.18.16.204
# cd /usr/share/nginx/html/
# rm -rf ./*
# cd ./dist
# scp ./test.txt root@172.18.16.204:/usr/share/nginx/html/

remote_directory=/usr/share/nginx/html/test

ssh "root@172.18.16.204" << EOF
  echo "成功连接到远程服务器"
  cd $remote_directory || { echo "无法进入目录 $remote_directory"; exit 1; }
  echo "成功进入文件夹：$remote_directory"
  rm -rf ./*
  echo "已经清空文件夹内容：$remote_directory"
EOF

echo "当前文件路径:$PWD"

scp -r ./dist/* root@172.18.16.204:/usr/share/nginx/html/test
echo "发布到远程成功"