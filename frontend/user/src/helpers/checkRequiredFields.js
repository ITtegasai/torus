export const isCompletedRequired = (user, fields) => {
    let flag = true;
    fields.forEach(field => {
        if(!user[field]) {
            flag = false;
            return
        }
    });

    return flag;
}