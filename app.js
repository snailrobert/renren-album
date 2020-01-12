#!/usr/bin/env node

const path = require('path')

const package = require('./package.json')
const program = require('commander')

const login = require('./login')
const photo = require('./photo')
const keyword = require('./keyword')
const config = require('./config')

const fs =require('fs')

program
  .version(package.version)
  .option('-l, --login', 'login renren')
  .option('-d, --download', 'download album')
  .option('-u, --username [string]', 'append username')
  .option('-p, --password [string]', 'append password')
  .option('-k, --keyword [string]', 'append keyword')
  .option('-n, --number [number]', 'the number of keyword images you want to download, default 10')
  .option('-i, --userid [string]', 'specify download someone\'s album by user id')
  .option('-a, --friend', 'find my friends')
  .option('-b, --follow', 'find follow me')
  .option('-m, --profile', 'log my profile')
  .parse(process.argv)

async function run() {
  if (program.login) {
    if (program.username === undefined) {
      console.log('必须输入用户名: 参考 -u')
    } else if (program.password === undefined) {
      console.log('必须输入密码: 参考 -p')
    } else {
      await login(program.username, program.password)
    }
  } else if (program.download) {
    if (program.userid === undefined) {
      await photo.getSelfAlbum()
    } else if (program.userid === '123') {
      const renrenallfriendsPath = path.resolve(config.storageDir, 'renrenallfriends.json')
      console.log(renrenallfriendsPath)
      fs.readFile(renrenallfriendsPath,'utf-8',(err,data)=>{
        if(err){
            console.log('读取文件失败');
            return console.log(err);
        }else{
            console.log(data.toString());
            exec(data.toString())
        }
      })
    } else {
      await photo.getAlbum(program.userid, '') 
    }
      // var userIds = new Array("229012342","234494951", "225279695","224720335", "229415744","267089521", "240603554","347537590", "254530394","225186486"
      //   , "243218312","230223380", "229248006","222277140");
      // var usernames = new Array("冯燕","高冬兰", "戈范花","黄静", "金静娟","金颖", "林婷","吕霞琴", "沈喜凤","史珍珠", "孙丽花","翁芳", "吴燕","邹学敏");
      // for (x in userIds) {
        //await photo.getAlbum(userIds[x], usernames[x])
      // }
  } else if (program.keyword) {
    await keyword.getPhoto(program.keyword, program.number || 10)
  } else if (program.profile) {
    await photo.getMyProfile()
  } else if (program.friend) {
    await photo.getMyFriends()
  } else if (program.follow) {
    await photo.getMyFollow()
  } 
}

async function exec(jstr) {
   const users = JSON.parse(jstr)
   for (let i = 0; i < users.length; i++) {
      if(i < 2) {
        await photo.getAlbum(users[i].uid, users[i].uname)
      }
   }
}

run()

process.on('unhandledRejection', err => {
  console.log('unhandledRejection', err)
})
