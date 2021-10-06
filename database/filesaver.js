const db = require('../config/connection')
const collection = require('../config/collection')

module.exports={

    //saving user deatils to db

    saveUser:(user)=>{
        db.get().collection(collection.USER_COLLECTION).createIndex({userId:1},{unique:true})
        db.get().collection(collection.USER_COLLECTION).insertOne(user).catch((err)=>{
            console.log('already existing user');
        })
    },


    saveGroup:(group)=>{
        db.get().collection(collection.GROUP_COLLECTION).createIndex({groupId:1},{unique:true})
        db.get().collection(collection.GROUP_COLLECTION).insertOne(group).catch((err)=>{
            console.log('already existing group');
        })
    },

    //getting user data for statitics and broadcast purpose

    getUser:()=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).find().toArray().then((res)=>{
                resolve(res);
                
            })
        })
    },

    getGroup:()=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.GROUP_COLLECTION).find().toArray().then((res)=>{
                resolve(res);
                
            })
        })
    },

    getMedia:()=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.FILE_COLLECTION).find().toArray().then((res)=>{
                resolve(res);
                
            })
        })
    },


    getBan:()=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.BANNED_COLLECTION).find().toArray().then((res)=>{
                resolve(res);
                
            })
        })
    },

    //updating user database by removing blocked users details from the database

    updateUser:(userId)=>{
        db.get().collection(collection.USER_COLLECTION).deleteOne({userId:userId}).then((res)=>{
            console.log('updated user database');
        })
    },

    //saving files to database

    saveFile:(fileDetails)=>{
        db.get().collection(collection.FILE_COLLECTION).createIndex({file_name:"text"})
        db.get().collection(collection.FILE_COLLECTION).insertOne(fileDetails).then((res)=>{
            console.log('file saved');
        })
    },

    //searching and finding file id from database

    getFile1:(query1)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.FILE_COLLECTION).find({mediaId:query1}).toArray().then((res1)=>{
                resolve(res1)
            })
        })
    },

    getFile2:(query2)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.FILE_COLLECTION).findOne({uniqueId:query2}).then((res2)=>{
                resolve(res2)
            })
        })
    },

    //getting file as array for inline query

    getfileInline:(query)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.FILE_COLLECTION).find( { file_name: { $regex:query ,$options:'i'} } ).toArray().then((res)=>{
                console.log(res);
                resolve(res)
            }) 
        })
    },

    //removing file with file_id

    removeFile:(fileId)=>{
        db.get().collection(collection.FILE_COLLECTION).removeOne({file_id:fileId})
    },

    //removing file with mediaId
    removeFileMedia:(media)=>{
        db.get().collection(collection.FILE_COLLECTION).remove({mediaId:media})
    },

    //ban user with user ID
    banUser:(id)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.BANNED_COLLECTION).insertOne(id).then((res)=>{
                resolve(res)
            })
        })
    },

    //Checking if user is banned or not to acess the bot

    checkBan:(id)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.BANNED_COLLECTION).findOne({id:id}).then((res)=>{
                console.log(res);
                if(res){
                    resolve(true)
                }else{
                    resolve(false)
                }
            })
        })
    },

    //unban the user with user ID

    unBan:(id)=>{
        return new Promise(async(resolve,reject)=>{
           await db.get().collection(collection.BANNED_COLLECTION).deleteOne(id).then((res)=>{
                console.log(res);
                resolve(res)
            })
        })
    },

    //remove the whole collection to remove all files

    deleteCollection:()=>{
        db.get().collection(collection.FILE_COLLECTION).deleteMany({}).then((res)=>{
            console.log(res);
        })
    },
    //removing all files send by a user
    
    removeUserFile:(id)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.FILE_COLLECTION).deleteMany({userId:id}).then((res)=>
            resolve(res))
        })
    }
}
