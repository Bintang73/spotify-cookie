const fetch = require('node-fetch');
var rnd = require("node-random-name");
const { v4: uuidv4 } = require('uuid');
const { HttpsProxyAgent } = require("https-proxy-agent");

class SpotifyAuth {
    constructor(domain, proxy, password, apikey) {
        this.api = fetch;
        this.domain = domain;
        this.proxy = proxy;
        this.password = password;
        this.apikey = apikey;
    }

    randomUseragent() {
        const browsers = ['Mozilla', 'Firefox', 'Explorer'];
        const browser = browsers[Math.floor(Math.random() * browsers.length)];

        const androidVersions = ['10', '11', '12', '12.1', '13'];
        const androidVersion = androidVersions[Math.floor(Math.random() * androidVersions.length)];

        const operatingSystems = ['Windows', 'Linux'];
        const os = operatingSystems[Math.floor(Math.random() * operatingSystems.length)];

        const mobile = Array(7)
            .fill('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
            .map(str => str[Math.floor(Math.random() * str.length)])
            .join('');

        const chromeVersion = `${Math.floor(Math.random() * 89) + 11}.${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 8888) + 1111}.${Math.floor(Math.random() * 89) + 10}`;
        const safariVersion = `${Math.floor(Math.random() * 889) + 111}.${Math.floor(Math.random() * 89) + 11}`;
        const browserVersion = `${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 10)}`;

        return `${browser}/${browserVersion} (${os}; Android ${androidVersion}; ${mobile}) AppleWebKit/${safariVersion} (KHTML, like Gecko) Chrome/${chromeVersion} Mobile Safari/${safariVersion}`;
    }

    generateRandomNumber(min, max) {
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        const formattedNumber = randomNumber < 10 ? `0${randomNumber}` : `${randomNumber}`;
        return formattedNumber;
    }

    async create() {
        var firstName = {
            'first': true
        };
        var name2 = rnd(firstName);
        var lastName = {
            'last': true
        };
        var name = rnd(lastName);
        var rndMail = Math.floor(Math.random() * 100) + 21;
        var fullName = name2 + name
        var gender = 1
        var apikey = this.apikey
        var iid = uuidv4()
        var ttl = `199${Math.floor(Math.random() * 9) + 1}` + "-" + this.generateRandomNumber(1, 11) + "-" + this.generateRandomNumber(1, 25);
        var email = fullName + rndMail + "@" + this.domain
        var password = this.password
        const useragent = this.randomUseragent();
        // const proxyAgent = new HttpsProxyAgent(this.proxy);

        const baseAPI = "https://spclient.wg.spotify.com:443/signup/public/v2/account/create";

        const param = {
            account_details: {
                birthdate: ttl,
                consent_flags: {
                    eula_agreed: true,
                    send_email: false,
                    third_party_email: true,
                },
                display_name: name2,
                email_and_password_identifier: {
                    email: email,
                    password: password,
                },
                gender: gender,
            },
            callback_uri: 'https://www.spotify.com/signup/challenge?locale=id',
            client_info: {
                api_key: apikey,
                app_version: 'v2',
                capabilities: [1],
                installation_id: iid,
                platform: 'www',
            },
            tracking: {
                creation_flow: '',
                creation_point: 'https://www.spotify.com/id/premium/',
                referrer: 'checkout',
            },
            recaptcha_token: 'null',
        };

        const headers = {
            'Content-Length': Buffer.byteLength(JSON.stringify(param)),
            'User-Agent': useragent,
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        };

        const getHtml = await fetch(baseAPI, {
            headers: headers,
            method: "POST",
            body: JSON.stringify(param),
            // agent: proxyAgent
        })

        const getJson = await getHtml.json()
        var result = {
            email: email,
            password: password,
            result: getJson
        }
        return result
    }

    async getCSRF() {
        const response = await this.api("https://accounts.spotify.com/en/login", {
            headers: {
                'User-Agent': this.randomUseragent(),
            },
        });

        const setCookieHeader = response.headers.get('set-cookie');
        const csrf = setCookieHeader.split("sp_sso_csrf_token=")[1].split(";")[0];
        const csrfsid = setCookieHeader.split("__Host-sp_csrf_sid=")[1].split(";")[0];

        return {
            csrf: csrf,
            csrf_id: csrfsid,
        };
    }

    async getCookie(loginToken, csrf, csrfsid) {
        const url = "https://www.spotify.com/api/signup/authenticate";
        const param = `splot=${loginToken}`;

        const headers = {
            'X-Csrf-Token': csrf,
            'User-Agent': this.randomUseragent(),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cookie': `__Host-sp_csrf_sid=${csrfsid};`,
        };

        const response = await this.api(url, {
            method: 'POST',
            body: param,
            headers: headers,
        });
        const setCookieHeader = response.headers.get('set-cookie');
        const spcdc = setCookieHeader.split("sp_dc=")[1].split(";")[0];

        return spcdc;
    }
}

module.exports = SpotifyAuth;
