/*
    Copyright 2023
    Script by @bintang_nur_pradana
    Gunakan dengan bijak
*/
const fs = require('fs');
const SpotifyAuth = require('./lib/spotify');
const readlineSync = require('readline-sync');

(async () => {
    const data = fs.readFileSync('config.json', 'utf8');
    const config = JSON.parse(data);

    const userInput = readlineSync.question('Amount: ');
    const mount = parseInt(userInput)

    for (let i = 0; i < mount; i++) {
        const spotifyAuth = new SpotifyAuth(config.domain, config.proxy, config.password, config.apikey);

        const createAcc = await spotifyAuth.create()
        if (createAcc?.result?.success) {
            const getCsrf = await spotifyAuth.getCSRF()

            if (getCsrf?.csrf_id) {
                const getCuki = await spotifyAuth.getCookie(createAcc.result.success.login_token, getCsrf.csrf, getCsrf.csrf_id);
                fs.appendFileSync("result.txt", createAcc.email + '|' + createAcc.password + '|' + getCuki + "\n");

                console.log(`[+] Email: ${createAcc.email} Sukses.`)
            } else {
                console.log(`[+] Email: ${createAcc.email} Gagal mendappatkan csrf.`)
            }
        } else {
            console.log(`[+] Email: ${createAcc.email} Akun gagal dibuat.`)
        }
    }

})()