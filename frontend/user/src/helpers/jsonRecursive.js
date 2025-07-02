export const recursiveIteration = (object) => {
    var str = ''
    if (typeof object == "object") {
        for (var key in object) {
            str += '<dt>' + key + '</dt>';
            recursiveIteration(object[key])
        }
    } else {
        str += '<dd>' + object + '</dd>';
    }

    return str;
}