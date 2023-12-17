import { lines, users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validation from '../validators.js';
import linesData from './lines.js';
import bcrypt from 'bcrypt';

const exportedMethods = {
    async getAllUsers() {
        const userCollection = await users();
        return await userCollection.find({}).toArray();
    },
    async getUserById(id) {
        id = validation.validId(id);            //subject to change
        const userCollection = await lines();
        const user = await userCollection.findOne({ _id: new ObjectId(id) });
        if (!user) throw 'Error: User not found';
        return user;
    },
    async getUserByEmail(email) {
        email = validation.validEmail(email);        //subject to change
        const userCollection = await users();
        const user = await userCollection.findOne({ email: email });
        if (!user) throw 'Error: User not found';
        return user;
    },
    async getUserByUserName(userName) {
        userName = validation.validString(userName);        //subject to change
        const userCollection = await users();
        const user = await userCollection.findOne({ userName: userName });
        if (!user) throw 'Error: User not found';
        return user;
    },
    async getUserByFirstName(firstName) {
        firstName = validation.validString(firstName);        //subject to change
        const userCollection = await users();
        const user = await userCollection.findOne({ firstName: { $regex: firstName, $options: 'i' } });
        if (!user) throw 'Error: User not found';
        return user;
    },
    async registerUser(userName, firstName, lastName, email, password, confirmPassword, line) {
        //subject to change
        try {
            userName = validation.validString(userName, 'User Name');
            firstName = validation.validString(firstName, 'First Name');
            lastName = validation.validString(lastName, 'Last Name');
            email = validation.validEmail(email, 'Email');
            password = validation.validPassword(password);
            confirmPassword = validation.validPassword(confirmPassword);
            line = validation.validString(line, 'Line');
        } catch (e) {
            throw `${e}`;
        }

        const userCollection = await users();
        const findUser = await userCollection.findOne({ userName: userName });
        if (findUser) {
            throw `Error: userName already exists, pick another.`;
        }

        const findEmail = await userCollection.findOne({ email: email });
        if (findEmail) {
            throw `Error: email already exists, pick another.`;
        }

        if (password !== confirmPassword) {
            throw 'Error: Passwords must be the same';
        }

        // const findLine = await linesData.getLineByName(line);
        // if (!findLine) {
        //     throw `Error: Line doesn't exists, please pick an existing line`
        // }

        const hashedPassword = await bcrypt.hash(password, 16);
        let newUser = {
            userName: userName,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            line: line,
            userBio: null,
            major: null,
            gradYear: null,
            big: null,
            littles: [],
            links: null,
            profilePicture: null
        }

        let insertInfo = await userCollection.insertOne(newUser);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'Error: Failed to add user';
        }
        return { insertedUser: true };

    },
    async loginUser(email, password) {
        const userCollection = await users()

        email = email.toLowerCase()
        const getUser = await userCollection.findOne({ email: email })
        if (getUser === null) {
            throw `Either the email or password is invalid`;
        }

        let passMatch = await bcrypt.compare(password, getUser.password)
        if (!passMatch) {
            throw `Either the email or password is invalid`;
        }
        return {
            userName: getUser.userName,
            firstName: getUser.firstName,
            lastName: getUser.lastName,
            userBio: getUser.userBio,
            major: getUser.major,
            gradYear: getUser.gradYear,
            line: getUser.line,
            big: getUser.big,
            littles: getUser.littles,
            email: getUser.email,
            profilePicture: getUser.profilePicture
        }
    },
    async updateProfile(user, email, password) {
        // user refers to an object describing the user

        let { firstName, lastName, userName, major, gradYear, userBio, profilePicture } = user;
        console.log(user);

        try {
            email = validation.validEmail(email, 'Email');
            password = validation.validPassword(password);
            firstName = validation.validName(firstName, 'First Name Edit');
            lastName = validation.validName(lastName, 'Last Name Edit');
            userName = validation.validUsername(userName);
            if (major === '') { major = null; }
            else major = validation.validString(major, 'Major Edit');
            if (gradYear === '') { gradYear = null; } //cant do negative years
            else gradYear = validation.validNumber(gradYear, 'gradYear Edit');
            if (userBio === '') { userBio = null; }
            else userBio = validation.validBio(userBio, 'Bio Edit');
            if (profilePicture === '') { profilePicture = null; }
            else profilePicture = validation.validLink(profilePicture, 'profilePicture Edit');
        } catch (e) {
            throw `${e}`;
        }

        let cleanedUser = {
            firstName: firstName,
            lastName: lastName,
            userName: userName,
            major: major,
            gradYear: gradYear,
            userBio: userBio,
            profilePicture: profilePicture
        }

        const userCollection = await users()
        email = email.toLowerCase()
        const getUser = await userCollection.findOne({ email: email })

        if (getUser === null) {
            // throw {code: 400, error: `Either the email or password is invalid`}
            throw `Either the email or password is invalid`;
        }

        let passMatch = await bcrypt.compare(password, getUser.password)
        if (!passMatch) {
            // throw {code: 400, error: `Either the email or password is invalid`}
            throw `Either the email or password is invalid`;
        }

        const filteredData = Object.fromEntries(
            Object.entries(cleanedUser).filter(([key, value]) => value !== 0)
        );
        console.log(filteredData);

        if (Object.keys(filteredData).length > 0) {
            const updateInfo = await userCollection.updateOne(
                { _id: getUser._id },
                { $set: filteredData },
            );
            if (!updateInfo) throw `Error: Update failed`

            return await updateInfo;
        } else {
            throw `Nothing to update`
        }
    },
    async assignLittles(userName, requested_userName) {
        const userCollection = await users();
        const lineCollection = await lines();

        const userInfo = await userCollection.findOne({ userName: userName });
        const newLittle = await userCollection.findOne({ userName: requested_userName });
        const userLine = await lineCollection.findOne({ lineName: getUser.line })

        // Check if users are found.
        if (!userInfo) {
            throw `Error: User not found.`;
        }
        if (!newLittle) {
            throw `Error: User searched not found.`;
        }

        // Check if selected user is already your little
        if (userInfo.littles.some(little => little._id.equals(newLittle._id))) {
            throw `Error: Selected Member is already your little.`;
        }

        if (newLittle.userName === userInfo.userName) {
            throw "Cannot assign yourself as your own big or little!";
        }
        if (newLittle.big) {
            throw "This person has a big already!";
        }
        if (newLittle.userName === userLine.lineHead.userName) {
            throw "Cannot assign a line head as your little!";
        }
        if (userInfo.big) {
            if ((newLittle.userName === userInfo.big)) {
                throw "Cannot assign your big as your little!";
            }
            let big = await userCollection.findOne({ userName: userInfo.big });
            if (userInfo.big.big) {
                if ((newLittle.userName === userInfo.big.big)) {
                    throw "Cannot assign your grandbig as your little!";
                }
            }
        }
        if (userInfo.littles.includes(newLittle) && (inputs.type === "little")) {
            throw "This member is already your little";
        }

        userInfo.littles.push(newLittle);
        newLittle.big = userInfo.userName;

        const updateuserInfo = await userCollection.updateOne(
            { _id: userInfo._id },
            { $push: { littles: newLittle } },
        );
        const updateLittleInfo = await userCollection.updateOne(
            { _id: newLittle._id },
            { $set: { big: userInfo.userName } }
        );

        if (!updateuserInfo) {
            throw `Error: Could not assign ${newLittle.userName} as the little for ${getUser.userName}`;
        }
        if (!updateLittleInfo) {
            throw `Error: Could not assign ${userInfo.userName} as the big for ${newLittle.userName}`
        }

        // Update the littles of ancestors recursively
        await linesData.updateAncestorsLittles(userCollection, userInfo.userName, newLittle);

        return updateuserInfo;
    }

}

export default exportedMethods;
