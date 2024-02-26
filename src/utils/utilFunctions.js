// util.js
const getPublicIdFromUrl = (url) => {
    
    const urlParts = url.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1];
    const [publicId, _] = filenameWithExtension.split(".");
    console.log(publicId)
    return publicId;
}

module.exports = { getPublicIdFromUrl };
