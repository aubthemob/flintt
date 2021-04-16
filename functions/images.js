const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore()

const { Storage } = require('@google-cloud/storage')
const gcs = new Storage()

const os = require('os') // --> gives us the tmpdir method
const path = require('path') // --> gives us join and dirname methods

const sharp = require('sharp')
const fs = require('fs-extra')

exports.resizeAvatar = functions.storage.object().onFinalize(async (object) => {
    const pathArr = object.name.split('/')
    if(pathArr[0] === 'avatars') {
        const bucket = gcs.bucket(object.bucket)
        const filePath = object.name
        const fileName = filePath.split('/').pop()
        const bucketDir = path.dirname(filePath)

        const workingDir = path.join(os.tmpdir(), 'thumbs')
        const tmpFilePath = path.join(workingDir, fileName)

        if (fileName.includes('thumb@') || !object.contentType.includes('image')) {
            console.log('exiting function')
            return false
        }

        await fs.ensureDir(workingDir)

        await bucket.file(filePath).download({
            destination: tmpFilePath
        })

        const sizes = [64, 192]

        const uploadPromises = sizes.map(async size => {
            const thumbName = `thumb@${size}_${fileName}`
            const thumbPath = path.join(workingDir, thumbName + '.jpeg')

            await sharp(tmpFilePath)
                .resize(size, size)
                .toFile(thumbPath)

            return bucket.upload(thumbPath, {
                destination: path.join(bucketDir, thumbName  + '.jpeg')
            })
        })

        await Promise.all(uploadPromises)
        return fs.remove(workingDir)
    }

    else {
        return false
    }
})
