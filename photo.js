const path = require('path')
const cheerio = require('cheerio')
const Request = require('axer').request
const file = require('axer').file
const config = require('./config')

async function getPhoto(album, dirname) {
  const cookieJarPath = path.resolve(config.storageDir, 'cookieJar.json')
  const request = new Request(cookieJarPath)

  // 获取相册内照片连接
  const albumResponse = await request.get(`http://photo.renren.com/photo/${album.ownerId}/album-${album.albumId}/v7`)
  const regex = /photo = ((.|\n)*|);\n;/g
  const m = regex.exec(albumResponse.body)
  const photoListContent = m && m[1]
  const photoListInfo = JSON.parse(photoListContent.replace(/'/g, '"'))
  console.log(JSON.stringify(photoListInfo, null, 2))

  for (let i = 0; i < photoListInfo.photoList.photoList.length; i++) {
    const photo = photoListInfo.photoList.photoList[i]
    // 创建相册目录
    const albumPath = path.resolve(config.storageDir, dirname, album.albumName)
    await file.mkdir(albumPath)

    const hdPhotoUrl = photo.url
    // const originalPhotoUrl = hdPhotoUrl.replace('large', 'original')
    const originalPhotoUrl = hdPhotoUrl

    const photoSavePath = path.resolve(albumPath, `${photo.photoId}.jpg`)
    // 下载照片
    try {
      await request.download(originalPhotoUrl, photoSavePath)
      const checkContent = await file.cat(photoSavePath)
      if (checkContent.indexOf('DOCTYPE') > 0) {
        console.log('不存在原图，开始下载高清图' + originalPhotoUrl)
        await request.download(hdPhotoUrl, photoSavePath)
      }
    } catch (error) {
      console.log('下载出现错误，将再次尝试一次下载')
      await request.download(originalPhotoUrl, photoSavePath)
      const checkContent = await file.cat(photoSavePath)
      if (checkContent.indexOf('DOCTYPE') > 0) {
        console.log('不存在原图，开始下载高清图' + hdPhotoUrl)
        await request.download(hdPhotoUrl, photoSavePath)
      }
    } 
  }
}

async function getAlbum(ownerId, dirname) {
  const cookieJarPath = path.resolve(config.storageDir, 'cookieJar.json')
  const request = new Request(cookieJarPath)

  // 获取相册详情
  const albumlistResponse = await request.get(`http://photo.renren.com/photo/${ownerId}/albumlist/v7`)
  const regex = /photo = ((.|\n)*|);\nnx/g
  const m = regex.exec(albumlistResponse.body)
  const albumlistContent = m && m[1]
  const albumlistInfo = JSON.parse(albumlistContent.replace(/'/g, '"'))
  console.log(JSON.stringify(albumlistInfo, null, 2))

  var dir = ownerId + dirname
  for(let i = 0; i < albumlistInfo.albumList.albumList.length; i++) {
    const album = albumlistInfo.albumList.albumList[i]
    // 获取相册内到照片 `${album.ownerId}`
    try {
      await getPhoto(album, dir) 
    } catch (error) {
      console.log('获取照片失败', error)
    }
  }
}

async function getSelfAlbum() {
  const cookieJarPath = path.resolve(config.storageDir, 'cookieJar.json')
  const request = new Request(cookieJarPath)

  const homeResponse = await request.get('http://www.renren.com')

  const $ = cheerio.load(homeResponse.body)
  // 运行脚本获取数据并删除污染变量
  let nxcontent = $('script').first().text()
  console.log(homeResponse.body)
  eval(nxcontent)
  const user = nx.user
  delete nx
  console.log(user)

  await getAlbum(user.id, user.id)
}

async function getMyProfile() {
  const cookieJarPath = path.resolve(config.storageDir, 'cookieJar.json')
  const request = new Request(cookieJarPath)
  const homeResponse = await request.get('http://www.renren.com')

  const $ = cheerio.load(homeResponse.body)
  // 运行脚本获取数据并删除污染变量
  let nxcontent = $('script').first().text()
  // console.log(homeResponse.body)
  eval(nxcontent)
  const user = nx.user
  delete nx
  console.log(user)
}

async function getMyFriends() {
// http://friend.renren.com/managefriends
  const cookieJarPath = path.resolve(config.storageDir, 'cookieJar.json')
  const request = new Request(cookieJarPath)
  const friendsResponse = await request.get('http://friend.renren.com/GetFriendList.do?curpage=1&id=238551060')
  console.log(friendsResponse.body)
  // const $ = cheerio.load(friendsResponse.body)
  // let nxcontent = $('script').last().text()
  // console.log(nxcontent)
  // eval(nxcontent)
  // const user = nx.user
  // delete nx
  // console.log(user)
}

async function getMyFollow() {

}

exports.getSelfAlbum = getSelfAlbum
exports.getAlbum = getAlbum
exports.getMyProfile = getMyProfile
exports.getMyFriends = getMyFriends
exports.getMyFollow = getMyFollow
