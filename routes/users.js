// LINES or USERS???
import express from 'express';
import path from 'path';
import * as validator from '../validators.js';
import usersData from '../data/users.js';
import linesData from '../data/lines.js';
import { stringify } from 'querystring';
const router = express.Router();

// middleware to not be there?
router.route('/')
    .get(async (req, res) => {
        // return res.json({ error: 'YOU SHOULD NOT BE HERE!' });
    });

// login route (from 555 project)
router.route('/login')
    .get(async (req, res) => {
        res.render('login', { pageTitle: 'Login' });
    })
    .post(async (req, res) => {
        const inputs = req.body;
        try {
            if (!inputs.email || !inputs.password) {
                return res.status(400).render('login', { error: "Username or password is incorrect" });
            }
        } catch (e) {
            return res.status(400).render('login', { error: e });
        }
        try {
            let checkExists = await usersData.loginUser(inputs.email, inputs.password);
            console.log(checkExists)
            req.session.user = {
                firstName: checkExists.firstName,
                lastName: checkExists.lastName,
                userName: checkExists.userName,
                email: checkExists.email,
                line: checkExists.line,
            };
            res.redirect('/users/profile');
        } catch (e) {
            console.error(e)
            return res.status(400).render('errors', { error: e });
        }
    });

// register route from lab 10 (Branden)
router.route('/register')
    .get(async (req, res) => {
        //code here for GET
        const allLines = await linesData.getAllLines();
        res.render('register', { pageTitle: 'Register', lines: allLines });
    })
    .post(async (req, res) => {
        //code here for POST
        const submittedToken = req.body.csrfToken;

        let { userName, firstName, lastName, email, password, confirmPassword, line } = req.body;

        if (!userName || !firstName || !lastName || !email || !password || !confirmPassword || !line) {
            return res.status(400).render('errors', { error: 'All fields are required.' });
        }

        console.log('--- Checked All Fields ---');
        try {
            userName = validator.validUsername(userName);
            firstName = validator.validName(firstName, 'First Name');
            lastName = validator.validName(lastName, 'Last Name');
            email = validator.validEmail(email, 'Email routes');
            password = validator.validPassword(password);
            confirmPassword = validator.validPassword(confirmPassword);
            line = validator.validString(line, 'line');
        } catch (e) {
            console.error(e);
            res.status(400).render('errors'), { error: `${e}` };
        }

        console.log('--- Validating each field ---');
        if (password !== confirmPassword) {
            return res.status(400).render('errors', { error: 'Passwords do not match.' });
        }

        console.log('--- Confirming password ---');

        try {
            const result = await usersData.registerUser(userName, firstName, lastName, email, password, confirmPassword, line);
            console.log(result);
            if (result.insertedUser) {
                let checkExists = await usersData.loginUser(email, password);
                console.log(checkExists)
                req.session.user = {
                    firstName: checkExists.firstName,
                    lastName: checkExists.lastName,
                    userName: checkExists.userName,
                    email: checkExists.email,
                    line: checkExists.line,
                };
                const addtoline = await linesData.addMember(line, checkExists)
                console.log(addtoline)
                res.redirect('/users/profile');
            } else {
                // ! different status code
                res.status(500).render('errors', { error: 'Internal Server Error' });
            }
        } catch (e) {
            console.error(e)
            res.status(500).render('errors', { error: 'Internal Server Error' });
        }

    });


// // home page (navigation to login, register, search profiles, and view own profile)
// router.route('/users/home')
//     .get(async (req, res) => {
//         res.render('profile');
//     });

// profile
router.route('/profile')
    .get(async (req, res) => {
        console.log(req.session.user)
        const userInfo = await usersData.getUserByEmail(req.session.user.email)
        res.render('profile', {
            pageTitle: 'Your Profile',
            user: userInfo
            // gradYear: req.session.user.gradYear.toString()
        });
    });

// profile edit
router.route('/profile/edit')
    .get(async (req, res) => {
        const userInfo = await usersData.getUserByEmail(req.session.user.email)
        res.render('edit-profile', { pageTitle: 'Edit Profile', user: userInfo })
    })
    .post(async (req, res) => {
        let { firstName, lastName, userName, major, gradYear, bio, email, password } = req.body;
        let user = null;

        // validate email and password
        console.log('stage 1')
        try {
            email = validator.validEmail(email, "Confirm Email");
            password = validator.validPassword(password);
        } catch (e) {
            res.status(400).render('errors', { error: 'Either email or password is invalid' });
        }

        console.log('stage 3')
        try {
            user = await usersData.getUserByEmail(email);
        } catch (e) {
            res.status(404).render('errors', { error: 'User not found' })
        }

        try {
            if (firstName.trim() !== '') {
                firstName = validator.validName(firstName, 'First Name Edit');
            }
            if (lastName.trim() !== '') {
                lastName = validator.validName(lastName, 'Last Name Edit');
            }
            if (userName.trim() !== '') {
                userName = validator.validUsername(userName);
            }
            if (major.trim() !== '') {
                major = validator.validString(major, 'Major Edit');
            }
            if (gradYear.trim() !== '') {
                gradYear = validator.validNumber(parseInt(gradYear), 'gradYear Edit');
            }
        } catch (e) {
            res.status(400).render('errors', { error: e });
        }

        console.log('stage 4')
        const updateBody = {
            firstName: firstName,
            lastName: lastName,
            userName: userName,
            major: major,
            gradYear: gradYear,
            userBio: bio
        }
        try {
            const updateInfo = await usersData.updateProfile(updateBody, email, password);
            res.redirect('/users/profile')
        } catch (e) {
            res.status(500).render('errors', { error: 'Internal server error' })
        }
    });

router.route('/searchuser')
    .get(async (req, res) => {
        res.render('searchResults');
    })
    .post(async (req, res) => {
        try {
            let searchTerm = req.body.searchMember;
            searchTerm = validator.validString(searchTerm, 'Member Name URL parameter');
            let names = await characterData.searchCharacterByName(searchTerm);
            res.render('searchResults', { title: "People Found", searchMember: searchTerm, member: names })
        } catch (e) {
            return res.status(400).render('error', { title: "Error", error: `Invalid input: '${req.body.searchCharacterByName}'`, class: "error" })
        }
    });

router.route('/searchuser/:userName')
    .get(async (req, res) => {
        // res.render('searchResults', { title: "People Found", searchCharacterByName: searchTerm, characters: names })
    });

router.route('/assignBigLittle')
    .get(async (req, res) => {

    });

router.route('/logout').get(async (req, res) => {
    req.session.destroy();
    return res.redirect('/');
});
export default router;

// GET REQUESTS:
// Search bar features: line name, profile name, graduation year, major
// Each sends a list of names
// ID specific pages: lines, users
// Comment Board: comments (comments might become its own collection)
// Nov 28, 2023 POST REQUESTS: User profile, Lines, Comments

