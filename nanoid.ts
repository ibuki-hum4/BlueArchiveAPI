import { customAlphabet } from 'nanoid';

// 英数字のみで 8 文字の ID を生成
const nanoid8 = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);

// 1回だけ生成して表示
console.log(nanoid8());