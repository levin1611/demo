/* eslint-disable no-prototype-builtins */
import CryptoJS from 'crypto-js';
import {
    decode,
    encode
} from 'js-base64';
import Cookies from 'js-cookie';
import NodeRSA from 'node-rsa';
import keyDatas from './secret-key';

const ENV = process.env.NODE_ENV;
const forbidden = 'U0JDT01FT04=';
const objectApiKey = ['leadViewType', 'customerViewType', 'opportunityViewType', 'contactViewType','leadViewItem', 'customerViewItem', 'opportunityViewItem', 'contactViewItem'];
const whiteStore = [forbidden, 'leadsCloud-followupType', 'xhl_remember_me', 'xhl_dId', 'LANG', 'isAgreed', 'mail_table_viewModule', 'currencyExchangeObj', 'loginType', 'loginPhone', 'workBenchCurrency', 'accountData', 'xhl_login_type', 'quitUnexpectedlyMsg', 'quitUnexpectedlyReason'].concat(ENV === 'development' ? [] : ['loglevel:webpack-dev-server']);
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

/**
 * @Description: 生成浏览器指纹, 目前仅使用了 audio api 生成指纹
 * 参考 https://audiofingerprint.openwpm.com/ 网站源码
 * 实际开发中, 发现 fingerprintjs 库(https://github.com/fingerprintjs/fingerprintjs)也用的相似的参数值,
 * https://github.com/fingerprintjs/fingerprintjs/blob/master/src/sources/audio.ts 中使用的数值与本方法中的数据基本相同,
 * 之后如果要获取其他数据生成指纹, 可参考此项目 src/source/index.ts , 其顶部引入了很多获取设备信息的方法, 想要啥信息直接去引入文件找
 * ps: 之所以不直接用 fingerprintjs 库, 是因为前期调研发现它"不同版本的 chrome 浏览器生成的标识不同", 而参考网站就没这个问题
 * @author 汤一飞
 * @date 2022/3/11
 */
export const gen_fingerPrint = (useFullPrint = true) => {
    return new Promise((resolve, reject) => {
        try {
            let shortPrint = '';
            let fullPrint = '';

            const context = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);

            const pxi_oscillator = context.createOscillator();
            pxi_oscillator.type = 'triangle';
            pxi_oscillator.frequency.value = 1e4;

            // Create and configure compressor
            const pxi_compressor = context.createDynamicsCompressor();
            pxi_compressor.threshold && (pxi_compressor.threshold.value = -50);
            pxi_compressor.knee && (pxi_compressor.knee.value = 40);
            pxi_compressor.ratio && (pxi_compressor.ratio.value = 12);
            pxi_compressor.reduction && (pxi_compressor.reduction.value = -20);
            pxi_compressor.attack && (pxi_compressor.attack.value = 0);
            pxi_compressor.release && (pxi_compressor.release.value = 0.25);

            // Connect nodes
            pxi_oscillator.connect(pxi_compressor);
            pxi_compressor.connect(context.destination);

            // Start audio processing
            pxi_oscillator.start(0);
            context.startRendering();
            context.oncomplete = function (evnt) {
                let pxi_output = 0;
                const sha1 = CryptoJS.algo.SHA1.create();
                for (let i = 0; i < evnt.renderedBuffer.length; i++) {
                    sha1.update(evnt.renderedBuffer.getChannelData(0)[i].toString());
                }
                const hash = sha1.finalize();
                // Fingerprint using DynamicsCompressor (hash of full buffer):
                fullPrint = hash.toString(CryptoJS.enc.Hex);

                for (let i = 4500; i < 5e3; i++) {
                    pxi_output += Math.abs(evnt.renderedBuffer.getChannelData(0)[i]);
                }
                // Fingerprint using DynamicsCompressor (sum of buffer values):
                shortPrint = pxi_output.toString();

                pxi_compressor.disconnect();

                resolve(`${useFullPrint ? fullPrint : shortPrint}`);
            };
        } catch (err) {
            console.error(err);
            resolve('');
        }
    });
};
