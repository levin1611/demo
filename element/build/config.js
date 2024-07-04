import Env from './env';

let env = Env;
if (env !== 'development') {
    env = 'production';
}

// let config = {
//     env
// };
// export default config;
export { env };
