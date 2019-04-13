import firebase, { db } from '~/plugins/firebase'
import handleError from '~/utils/handleError'
import compressImage from '~/utils/compressImage'

export const actions = {
  uploadImage ({ commit }, file) {
    return new Promise((resolve, reject) => {
      const fileName = file.name
      const filePath = `compressing/${fileName}`
      // upload the image to temp storage ready for compression.
      firebase.storage().ref(filePath).put(file).then(() => {
        // compress the image and get back it's public url.
        return compressImage(filePath, {
          maxWidth: 200, // Set max width
          maxHeight: 200, // Set max height
          crop: false, // crop the image to fit
          deleteAfter: true, // Delete the orgiginally uploaded image (@ filePath). Usually true unless you're making copies of the same image
          destination: `public/img` // Destination path for the final cropped image in cloud storage.
        })
      }).then(url => resolve(url))
        .catch(e => handleError(commit, e, reject))
    })
  },
  uploadProfilePic ({ commit, rootState }, file) {
    return new Promise((resolve, reject) => {
      const userID = rootState.user.userID
      const fileName = file.name
      const filePath = `compressing/${fileName}`
      // upload the image to temp storage ready for compression.
      firebase.storage().ref(filePath).put(file).then(() => {
        // compress the image and get back it's public url.
        return compressImage(filePath, {
          maxWidth: 600,
          maxHeight: 600,
          crop: true,
          deleteAfter: true,
          destination: `${userID}/img`
        })
      }).then((url) => {
        db.collection('users').doc(userID).set({
          photoURL: url
        }, { merge: true }).then(resolve())
      }).catch(e => handleError(commit, e, reject))
    })
  }
}
