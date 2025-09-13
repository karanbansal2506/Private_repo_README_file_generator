const express = require('express');
const app = express();
require('dotenv').config();
const { ReadMe_generator } = require('./generator');

const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const redirectUri = 'http://localhost:3000/callback';
const scope = 'repo user';
let AccessToken = ''
let Repo_Data = ''

const repoOwner = process.env.GITHUB_REPO_OWNER;
const repoName = process.env.GITHUB_REPO_NAME;

// I wanted to access repo only one time to get repo data , that's why i didn't created session and state (as I would have to store state temporarily somewhere , usually it is stored in session for checking when we get callback ).
// state is helpful for session management and security and work like session token for security 

app.get('/login', (req, res) => {
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    res.redirect(authUrl);
})

app.get('/callback', async (req, res) => {
    const { code } = req.query;

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
        })
    });
    const tokenData = await tokenResponse.json();   
    AccessToken = tokenData.access_token;

    const userResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
        headers: { Authorization: `Bearer ${AccessToken}` }
    })
    const repoData = await userResponse.json()
    const userResponse01 = await fetch(repoData.languages_url, {
        headers: { Authorization: `Bearer ${AccessToken}` }
    })
    const repoLangData = await userResponse01.json()
    const userResponse02 = await fetch(repoData.contents_url.replace("{+path}", ""), {
        headers: { Authorization: `Bearer ${AccessToken}` }
    })
    const repoContentData = await userResponse02.json()
    Repo_Data = {
        "repo_Data" : repoData,
        "repo_Languages" : repoLangData,
        "repo_Content" : repoContentData
    }
    ReadMe_generator(Repo_Data)
    res.json(Repo_Data)
});

app.listen(3000)




