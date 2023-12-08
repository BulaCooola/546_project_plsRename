// I don't know if we need this. Not hundred percent. - Branden Bulatao
import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import user from './users.js'
import validation from '../validators.js';
import bcrypt from 'bcrypt';

const exportedMethods = {
    async getAllUsers(){
        const userCollection = await users();
        return await userCollection.find({}).toArray();
    },
    async getUserById(id) {
        id = validation.validId(id);            //subject to change
        const userCollection = await lines();
        const user = await userCollection.findOne({_id: new ObjectId(id)});
        if (!user) throw 'Error: User not found';
        return user;
    },
    async getUserByEmail(email){
        email = validation.validEmail(email);        //subject to change
        const userCollection = await users();
        const user = await userCollection.findOne({_email: email});
        if (!user) throw 'Error: Line not found';
        return user;
    },
    async registerUser(userName, userBio, firstName, lastName, email, password, confirmPassword, major, gradYear, big, littles, links){
        //subject to change
    },
    async loginUser(emailAddress, password){
        validation.loginCheck(emailAddress, password)

        const userCollection = await users() 
      
        emailAddress = emailAddress.toLowerCase()
        const getUser = await userCollection.findOne({emailAddress: emailAddress})
        if (getUser === null) {
            throw {code: 400, error: `Either the emailAddress or password is invalid`}
        }
      
        let passMatch = await bcrypt.compare(password, getUser.password) 
        if (!passMatch) {
            throw {code: 400, error: `Either the emailAddress or password is invalid`}
        }
        return {
            firstName: getUser.firstName,
            lastName: getUser.lastName,
            userName: getUser.userName,
            userBio: getUser.userBio,
            gradYear: getUser.gradYear,
            big: getUser.big,
            littles: getUser.littles,
            emailAddress: getUser.emailAddress
        }
    }
}

export default exportedMethods;