import { Crypto } from '@peculiar/webcrypto';
// ensure react-native-get-random-values & url-polyfill have already run
const globalCrypto = global.crypto || new Crypto();
export default globalCrypto;
export const webcrypto = globalCrypto;
