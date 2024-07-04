/* eslint-disable no-prototype-builtins */
import {
    decode,
    encode
} from 'js-base64';
import Cookies from 'js-cookie';
import NodeRSA from 'node-rsa';
import keyDatas from './secret-key';

const ENV = 'development';
const forbidden = 'U0JDT01FT04=';
const whiteStore = [forbidden, 'leadsCloud-followupType', 'xhl_remember_me', 'xhl_dId', 'LANG', 'isAgreed', 'mail_table_viewModule', 'currencyExchangeObj', 'loginType', 'loginPhone', 'workBenchCurrency'].concat(ENV === 'development' ? [] : ['loglevel:webpack-dev-server']);
class SignKeyRsa {
    constructor(keyData) {
        const key = new NodeRSA(keyData, 'pkcs8-public', {
            encryptionScheme: 'pkcs1'
        });
        this.pub = key;
    }

    encrypted(text, type = 'base64') {
        return this.pub.encrypt(text, type);
    }

    decrypt(encrypted, type = 'utf8') { // 私钥解密
        return this.pub.decrypt(encrypted, type);
    }

    decryptPublic(encrypted, type = 'utf8') { // 公钥解密
        return this.pub.decryptPublic(encrypted, type);
    }
}
class InfoEncode {
    constructor(name, en, de, pde) {
        this.name = name;
        this.target = {
            account: 'c2I=',
            password: 'c2Ir'
        };
        this.store = {
            account: '',
            password: ''
        };
        this.bencode = en;
        this.bdencode = de;
        this.pde = pde;
        if (!name || typeof en !== 'function' || typeof de !== 'function') throw Error('参数错误');
    }

    check() {
        try {
            const store = localStorage.getItem(this.name);
            let name = (Cookies.get('xhl_account'));
            let pass = (Cookies.get('xhl_password'));
            if (name && pass) {
                name = this.bdencode(name);
                pass = this.bdencode(pass);
                this.setInfo(name, pass);
                this.store.account = name;
                this.store.password = this.pde.encrypted(pass);
            } else if (store && this.isJSON(store)) {
                const o = JSON.parse(store);
                this.store = this.decode(o[this.target.account], o[this.target.password]);
            }
        } catch (error) {
            console.error(error);
        }
        Cookies.remove('xhl_account');
        Cookies.remove('xhl_password');
    }

    setInfo(name, pass) {
        const o = {};
        o[this.target.account] = this.encode(name, 'account');
        o[this.target.password] = this.encode(pass);
        localStorage.setItem(this.name, JSON.stringify(o));
    }

    encode(str, type) {
        if (!str) return '';
        try {
            if (type === 'account') return this.reserve(this.displacement(this.reserve(this.bencode(str))));
            // return this.displacement(this.reserve(this.displacement(this.reserve(this.bencode(str)))));
            return str;
        } catch (error) {
            return '';
        }
    }

    decode(name, password) {
        if (!name || !password) return '';
        return {
            account: this.reset(name),
            password
        };
    }

    reset(str) {
        return this.bdencode(this.reserve(this.displacement(this.reserve(str))));
    }

    reserve(str) {
        return str.split('').reverse().join('');
    }

    remove(name, pass) {
        return pass.substring(name.length);
    }

    displacement(str) {
        const arr = str.split('');
        const rs = [];
        for (let i = 0; i < arr.length; i++) {
            if ((i % 2) !== 0) {
                rs[i] = arr[i - 1];
            } else {
                rs[i] = arr[i + 1];
            }
        }
        return rs.filter(v => v).join('');
    }

    getInfo() {
        return this.store;
    }

    isJSON(str) {
        if (typeof str === 'string') {
            try {
                JSON.parse(str);
                return true;
            } catch (e) {
                return false;
            }
        } else {
            return false;
        }
    }
}
export const clearAllInfo = () => {
    const keys = Cookies.get();
    const storeKeys = localStorage.valueOf();
    const excludeKeys = ['accId', 'LANG', 'isSetShowContactList', 'isSetShowUpMailMenu'];
    for (const key in keys) {
        if (keys.hasOwnProperty(key) && !excludeKeys.includes(key)) {
            Cookies.remove(key);
        }
    }
    for (const key in storeKeys) {
        if (storeKeys.hasOwnProperty(key) && !whiteStore.some(v => v === key) && key.indexOf('mailhomeMenuWidth_') === -1) {
            localStorage.removeItem(key);
        }
    }
};
export const signRsa = new SignKeyRsa(keyDatas.login); // 登陆密码加密
export const mailAccountBindRsa = new SignKeyRsa(keyDatas.mailAccountBind); //
export const userpass = new InfoEncode(forbidden, encode, decode, signRsa);
